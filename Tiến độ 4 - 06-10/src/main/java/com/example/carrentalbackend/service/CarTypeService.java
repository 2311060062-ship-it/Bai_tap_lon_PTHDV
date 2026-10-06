package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.car.CarTypePageItem;
import com.example.carrentalbackend.dto.car.CarTypeRequest;
import com.example.carrentalbackend.dto.car.CarTypeResponse;
import com.example.carrentalbackend.dto.common.PageResponse;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.CarType;
import com.example.carrentalbackend.repository.CarRepository;
import com.example.carrentalbackend.repository.CarTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class CarTypeService {

    private final CarTypeRepository carTypeRepository;
    private final CarRepository carRepository;

    public CarTypeService(CarTypeRepository carTypeRepository, CarRepository carRepository) {
        this.carTypeRepository = carTypeRepository;
        this.carRepository = carRepository;
    }

    @Transactional(readOnly = true)
    public List<CarTypeResponse> findAll() {
        return carTypeRepository.findAll().stream()
                .map(type -> new CarTypeResponse(type.getCarTypeId(), type.getTypeName()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<CarTypePageItem> findPage(String keyword, int page, int pageSize) {
        int safePage = Math.max(page, 1);
        int size = pageSize < 1 ? 10 : pageSize;
        PageRequest request = PageRequest.of(safePage - 1, size, Sort.by("carTypeId").descending());
        Page<CarType> result = StringUtils.hasText(keyword)
                ? carTypeRepository.findByTypeNameContainingIgnoreCase(keyword.trim(), request)
                : carTypeRepository.findAll(request);
        List<CarTypePageItem> content = result.getContent().stream()
                .map(type -> new CarTypePageItem(type.getCarTypeId(), type.getTypeName()))
                .toList();
        return new PageResponse<>(result.getTotalElements(), content, size, safePage, result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public CarTypeResponse findById(Integer id) {
        CarType type = get(id);
        return new CarTypeResponse(type.getCarTypeId(), type.getTypeName());
    }

    @Transactional
    public CarTypeResponse create(CarTypeRequest request) {
        String name = requireName(request.typeName());
        if (carTypeRepository.existsByTypeNameIgnoreCase(name)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Loại xe này đã có trong danh mục");
        }
        CarType type = new CarType();
        type.setTypeName(name);
        type = carTypeRepository.save(type);
        return new CarTypeResponse(type.getCarTypeId(), type.getTypeName());
    }

    @Transactional
    public CarTypeResponse update(Integer id, CarTypeRequest request) {
        CarType type = get(id);
        String name = requireName(request.typeName());
        if (!name.equalsIgnoreCase(type.getTypeName()) && carTypeRepository.existsByTypeNameIgnoreCase(name)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Loại xe này đã có trong danh mục");
        }
        type.setTypeName(name);
        type = carTypeRepository.save(type);
        return new CarTypeResponse(type.getCarTypeId(), type.getTypeName());
    }

    @Transactional
    public void delete(Integer id) {
        CarType type = get(id);
        if (carRepository.countByCarType_CarTypeId(id) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Không xóa được: vẫn còn xe thuộc loại này");
        }
        carTypeRepository.delete(type);
    }

    private String requireName(String typeName) {
        if (!StringUtils.hasText(typeName)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nhập tên loại xe");
        }
        return typeName.trim();
    }

    private CarType get(Integer id) {
        return carTypeRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy loại xe"));
    }
}
