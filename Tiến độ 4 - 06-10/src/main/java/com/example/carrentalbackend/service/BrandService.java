package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.car.BrandRequest;
import com.example.carrentalbackend.dto.car.BrandResponse;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.Brand;
import com.example.carrentalbackend.repository.BrandRepository;
import com.example.carrentalbackend.repository.CarDetailRepository;
import com.example.carrentalbackend.repository.CarRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class BrandService {

    private final BrandRepository brandRepository;
    private final CarRepository carRepository;
    private final CarDetailRepository carDetailRepository;

    public BrandService(
            BrandRepository brandRepository,
            CarRepository carRepository,
            CarDetailRepository carDetailRepository
    ) {
        this.brandRepository = brandRepository;
        this.carRepository = carRepository;
        this.carDetailRepository = carDetailRepository;
    }

    @Transactional(readOnly = true)
    public List<BrandResponse> findAll() {
        return brandRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BrandResponse findById(Integer id) {
        return toResponse(get(id));
    }

    @Transactional
    public BrandResponse create(BrandRequest request) {
        String name = requireName(request.brandName());
        if (brandRepository.existsByBrandNameIgnoreCase(name)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hãng xe này đã có trong danh mục");
        }
        Brand brand = new Brand();
        apply(brand, name, request);
        return toResponse(brandRepository.save(brand));
    }

    @Transactional
    public BrandResponse update(Integer id, BrandRequest request) {
        Brand brand = get(id);
        String name = requireName(request.brandName());
        if (!name.equalsIgnoreCase(brand.getBrandName()) && brandRepository.existsByBrandNameIgnoreCase(name)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hãng xe này đã có trong danh mục");
        }
        apply(brand, name, request);
        return toResponse(brandRepository.save(brand));
    }

    @Transactional
    public void delete(Integer id) {
        Brand brand = get(id);
        if (carRepository.countByBrand_BrandId(id) > 0 || carDetailRepository.countByBrand_BrandId(id) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Không xóa được: vẫn còn xe thuộc hãng này");
        }
        brandRepository.delete(brand);
    }

    private void apply(Brand brand, String name, BrandRequest request) {
        brand.setBrandName(name);
        brand.setDescription(StringUtils.hasText(request.description()) ? request.description().trim() : null);
        brand.setLogoUrl(StringUtils.hasText(request.logoUrl()) ? request.logoUrl().trim() : null);
    }

    private String requireName(String brandName) {
        if (!StringUtils.hasText(brandName)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Nhập tên hãng xe");
        }
        return brandName.trim();
    }

    private Brand get(Integer id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy hãng xe"));
    }

    private BrandResponse toResponse(Brand brand) {
        return new BrandResponse(brand.getBrandId(), brand.getBrandName(), brand.getDescription(), brand.getLogoUrl());
    }
}
