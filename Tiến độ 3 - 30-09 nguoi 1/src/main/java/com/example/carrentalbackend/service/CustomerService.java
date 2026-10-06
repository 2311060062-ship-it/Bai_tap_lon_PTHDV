package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.customer.CustomerRequest;
import com.example.carrentalbackend.dto.customer.CustomerResponse;
import com.example.carrentalbackend.enums.CustomerStatus;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.Customer;
import com.example.carrentalbackend.model.Role;
import com.example.carrentalbackend.model.User;
import com.example.carrentalbackend.repository.CustomerRepository;
import com.example.carrentalbackend.repository.RoleRepository;
import com.example.carrentalbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(
            CustomerRepository customerRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> search(String keyword) {
        List<Customer> customers = StringUtils.hasText(keyword)
                ? customerRepository.findByCustomerNameContainingIgnoreCase(keyword.trim())
                : customerRepository.findAllWithUser();
        return customers.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(Integer id) {
        return toResponse(get(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (!StringUtils.hasText(request.username()) || !StringUtils.hasText(request.email())
                || !StringUtils.hasText(request.password()) || !StringUtils.hasText(request.customerName())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu thông tin khách hàng");
        }
        if (userRepository.existsByUserName(request.username()) || userRepository.existsByUserEmail(request.email())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tên đăng nhập hoặc email đã tồn tại");
        }
        Role role = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa seed role USER"));
        User user = new User();
        user.setUserName(request.username());
        user.setUserEmail(request.email());
        user.setUserFullName(request.customerName());
        user.setUserPhone(request.customerPhone());
        user.setUserPassword(passwordEncoder.encode(request.password()));
        user.setIsActive(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setRole(role);
        userRepository.save(user);

        Customer customer = new Customer();
        apply(customer, request);
        customer.setUser(user);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());
        if (customer.getStatus() == null) {
            customer.setStatus(CustomerStatus.ACTIVE);
        }
        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public CustomerResponse update(Integer id, CustomerRequest request) {
        Customer customer = get(id);
        apply(customer, request);
        customer.setUpdatedAt(LocalDateTime.now());
        return toResponse(customerRepository.save(customer));
    }

    @Transactional
    public void delete(Integer id) {
        Customer customer = get(id);
        customer.setStatus(CustomerStatus.INACTIVE);
        customer.getUser().setIsActive(false);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);
    }

    private void apply(Customer customer, CustomerRequest request) {
        if (StringUtils.hasText(request.customerName())) {
            customer.setCustomerName(request.customerName().trim());
            if (customer.getUser() != null) {
                customer.getUser().setUserFullName(request.customerName().trim());
            }
        }
        if (request.email() != null) {
            customer.setCustomerEmail(request.email().trim());
            if (customer.getUser() != null) {
                customer.getUser().setUserEmail(request.email().trim());
            }
        }
        if (request.customerPhone() != null) {
            String phone = request.customerPhone().trim();
            customer.setCustomerPhone(phone);
            if (customer.getUser() != null) {
                customer.getUser().setUserPhone(phone);
            }
        }
        if (request.customerAddress() != null) {
            customer.setCustomerAddress(request.customerAddress());
        }
        if (request.birthDate() != null) {
            customer.setBirthDate(request.birthDate());
        }
        if (request.idNumber() != null) {
            customer.setIdNumber(request.idNumber());
        }
        if (request.licenseNumber() != null) {
            customer.setLicenseNumber(request.licenseNumber());
        }
        if (request.status() != null) {
            customer.setStatus(request.status());
            if (customer.getUser() != null) {
                customer.getUser().setIsActive(
                        request.status() != CustomerStatus.LOCKED && request.status() != CustomerStatus.INACTIVE
                );
            }
        }
        if (StringUtils.hasText(request.password())) {
            if (request.password().length() < 6) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu tối thiểu 6 ký tự");
            }
            if (customer.getUser() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Khách hàng chưa có tài khoản để đổi mật khẩu");
            }
            customer.getUser().setUserPassword(passwordEncoder.encode(request.password()));
            userRepository.save(customer.getUser());
        }
    }

    private Customer get(Integer id) {
        return customerRepository.findWithUserById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getCustomerId(),
                customer.getUser() != null ? customer.getUser().getUserId() : null,
                customer.getUser() != null ? customer.getUser().getUserName() : null,
                customer.getCustomerName(),
                customer.getCustomerEmail(),
                customer.getCustomerPhone(),
                customer.getCustomerAddress(),
                customer.getBirthDate(),
                customer.getIdNumber(),
                customer.getLicenseNumber(),
                customer.getStatus(),
                customer.getCreatedAt()
        );
    }
}
