package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.car.CarAvailabilityResponse;
import com.example.carrentalbackend.dto.car.CarRequest;
import com.example.carrentalbackend.dto.car.CarResponse;
import com.example.carrentalbackend.enums.CarStatus;
import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.Booking;
import com.example.carrentalbackend.model.Brand;
import com.example.carrentalbackend.model.Car;
import com.example.carrentalbackend.model.CarDetail;
import com.example.carrentalbackend.model.CarImage;
import com.example.carrentalbackend.model.CarType;
import com.example.carrentalbackend.model.Pricing;
import com.example.carrentalbackend.repository.BookingRepository;
import com.example.carrentalbackend.repository.BrandRepository;
import com.example.carrentalbackend.repository.CarDetailRepository;
import com.example.carrentalbackend.repository.CarImageRepository;
import com.example.carrentalbackend.repository.CarRepository;
import com.example.carrentalbackend.repository.CarTypeRepository;
import com.example.carrentalbackend.repository.PricingRepository;
import com.example.carrentalbackend.util.BookingTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
public class CarService {

    private final CarRepository carRepository;
    private final BrandRepository brandRepository;
    private final CarTypeRepository carTypeRepository;
    private final CarDetailRepository carDetailRepository;
    private final CarImageRepository carImageRepository;
    private final PricingRepository pricingRepository;
    private final BookingRepository bookingRepository;

    public CarService(
            CarRepository carRepository,
            BrandRepository brandRepository,
            CarTypeRepository carTypeRepository,
            CarDetailRepository carDetailRepository,
            CarImageRepository carImageRepository,
            PricingRepository pricingRepository,
            BookingRepository bookingRepository
    ) {
        this.carRepository = carRepository;
        this.brandRepository = brandRepository;
        this.carTypeRepository = carTypeRepository;
        this.carDetailRepository = carDetailRepository;
        this.carImageRepository = carImageRepository;
        this.pricingRepository = pricingRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<CarResponse> search(Integer brandId, Integer carTypeId, CarStatus status, String keyword, BigDecimal maxPrice) {
        String key = StringUtils.hasText(keyword) ? keyword.trim() : null;
        return carRepository.search(brandId, carTypeId, key).stream()
                .map(this::toResponse)
                .filter(car -> status == null || car.status() == status)
                .filter(car -> maxPrice == null || car.price() == null || car.price().compareTo(maxPrice) <= 0)
                .toList();
    }

    @Transactional(readOnly = true)
    public CarAvailabilityResponse availability(Integer carId, LocalDate pickupDate, LocalDate returnDate, LocalTime pickupTime, LocalTime returnTime) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy xe"));
        if (car.getStatus() == CarStatus.MAINTENANCE) {
            return new CarAvailabilityResponse(false, "Xe đang bảo trì", null);
        }
        LocalDateTime start = BookingTime.startOf(pickupDate, pickupTime);
        LocalDateTime end = BookingTime.endOf(returnDate, returnTime);
        if (!end.isAfter(start)) {
            return new CarAvailabilityResponse(false, "Giờ trả xe phải sau giờ nhận xe", null);
        }
        if (start.isBefore(BookingTime.now())) {
            return new CarAvailabilityResponse(false, "Không đặt được khung giờ đã qua", null);
        }
        if (!BookingTime.isOfficeHour(pickupTime) || !BookingTime.isOfficeHour(returnTime)) {
            return new CarAvailabilityResponse(false, "Chỉ nhận/trả xe trong giờ hành chính 07:00 – 17:00", null);
        }
        var busy = bookingRepository.findByCar_CarId(carId).stream()
                .filter(item -> BookingTime.occupiesSlot(item, start, end))
                .toList();
        int units = car.getQuantity() == null || car.getQuantity() < 1 ? 1 : car.getQuantity();
        if (busy.size() >= units) {
            LocalDateTime until = busy.stream().map(BookingTime::endOf).max(LocalDateTime::compareTo).orElse(end);
            return new CarAvailabilityResponse(
                    false,
                    "Xe đã được đặt từ " + formatRange(start, until),
                    until
            );
        }
        return new CarAvailabilityResponse(true, "Xe còn trống trong khung giờ này", null);
    }

    public CarStatus effectiveStatus(Car car) {
        if (car.getStatus() == CarStatus.MAINTENANCE) {
            return CarStatus.MAINTENANCE;
        }
        int units = car.getQuantity() == null || car.getQuantity() < 1 ? 1 : car.getQuantity();
        long rented = bookingRepository.findByCar_CarId(car.getCarId()).stream()
                .filter(BookingTime::occupiesNow)
                .count();
        return rented >= units ? CarStatus.UNAVAILABLE : CarStatus.AVAILABLE;
    }

    @Transactional
    public void syncStatus(Car car) {
        if (car.getStatus() == CarStatus.MAINTENANCE) {
            return;
        }
        CarStatus next = effectiveStatus(car);
        if (car.getStatus() != next) {
            car.setStatus(next);
            carRepository.save(car);
        }
    }

    @Transactional(readOnly = true)
    public CarResponse findById(Integer id) {
        Car car = carRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy xe"));
        return toResponse(car);
    }

    @Transactional
    public CarResponse create(CarRequest request) {
        Car car = new Car();
        apply(car, request);
        car.setCreatedDate(LocalDateTime.now());
        car = carRepository.save(car);
        saveRelated(car, request);
        return toResponse(carRepository.findByIdWithRelations(car.getCarId()).orElse(car));
    }

    @Transactional
    public CarResponse update(Integer id, CarRequest request) {
        Car car = carRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy xe"));
        apply(car, request);
        carRepository.save(car);
        saveRelated(car, request);
        return toResponse(carRepository.findByIdWithRelations(car.getCarId()).orElse(car));
    }

    @Transactional
    public void delete(Integer id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy xe"));
        pricingRepository.findByCar_CarId(id).forEach(pricingRepository::delete);
        carImageRepository.findByCar_CarId(id).forEach(carImageRepository::delete);
        carDetailRepository.findByCar_CarId(id).forEach(carDetailRepository::delete);
        carRepository.delete(car);
    }

    private void apply(Car car, CarRequest request) {
        if (request.brandId() == null || request.brandId() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hãy chọn hãng xe");
        }
        if (request.carTypeId() == null || request.carTypeId() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Hãy chọn loại xe");
        }
        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy hãng xe"));
        CarType carType = carTypeRepository.findById(request.carTypeId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy loại xe"));
        car.setCarName(clip(request.carName(), 255));
        car.setLocation(clip(request.location(), 255));
        car.setQuantity(request.quantity() == null ? 1 : request.quantity());
        car.setStatus(request.status() == null ? CarStatus.AVAILABLE : request.status());
        car.setBrand(brand);
        car.setCarType(carType);
        car.setImageUrl(safeImageUrl(request.imageUrl()));
        car.setLatitude(request.latitude());
        car.setLongitude(request.longitude());
    }

    private void saveRelated(Car car, CarRequest request) {
        List<CarDetail> details = carDetailRepository.findByCar_CarId(car.getCarId());
        CarDetail detail = details.isEmpty() ? new CarDetail() : details.get(0);
        detail.setCar(car);
        detail.setBrand(car.getBrand());
        detail.setColor(clip(request.color(), 255));
        detail.setDescription(clip(request.description(), 255));
        detail.setEngine(clip(request.engine(), 255));
        detail.setFuelType(clip(request.fuelType(), 255));
        detail.setLicensePlate(normalizePlate(request.licensePlate()));
        detail.setSeatCount(request.seatCount());
        detail.setYear(request.year());
        carDetailRepository.save(detail);

        if (request.price() != null) {
            List<Pricing> pricings = pricingRepository.findByCar_CarId(car.getCarId());
            Pricing pricing = pricings.isEmpty() ? new Pricing() : pricings.get(0);
            pricing.setCar(car);
            pricing.setPrice(request.price());
            pricing.setUnit(request.unit() == null ? "DAY" : request.unit());
            pricingRepository.save(pricing);
        }

        if (StringUtils.hasText(request.imageUrl())) {
            List<CarImage> images = carImageRepository.findByCar_CarId(car.getCarId());
            CarImage primary = images.stream()
                    .filter(image -> Boolean.TRUE.equals(image.getIsPrimary()))
                    .findFirst()
                    .orElseGet(() -> {
                        CarImage image = new CarImage();
                        image.setCar(car);
                        image.setIsPrimary(true);
                        return image;
                    });
            primary.setImageUrl(safeImageUrl(request.imageUrl()));
            carImageRepository.save(primary);
        }
    }

    private String clip(String value, int max) {
        if (!StringUtils.hasText(value)) {
            return value;
        }
        String trimmed = value.trim();
        return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
    }

    private String safeImageUrl(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) {
            return null;
        }
        String trimmed = imageUrl.trim();
        if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Ảnh chưa tải lên máy chủ. Chọn lại ảnh rồi thêm xe.");
        }
        if (trimmed.length() > 255) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Đường dẫn ảnh quá dài. Hãy tải ảnh lên thay vì dán URL.");
        }
        return trimmed;
    }

    private String normalizePlate(String plate) {
        if (!StringUtils.hasText(plate)) {
            return plate;
        }
        String raw = plate.toUpperCase().replaceAll("[^A-Z0-9]", "");
        if (raw.length() < 7) {
            return plate.toUpperCase().trim();
        }
        int letterEnd = 2;
        while (letterEnd < raw.length() && Character.isLetter(raw.charAt(letterEnd)) && letterEnd < 4) {
            letterEnd++;
        }
        String head = raw.substring(0, letterEnd);
        String nums = raw.substring(letterEnd);
        if (nums.length() >= 5) {
            return head + "-" + nums.substring(0, 3) + "." + nums.substring(3, 5);
        }
        return plate.toUpperCase().trim();
    }

    private CarResponse toResponse(Car car) {
        List<CarDetail> details = carDetailRepository.findByCar_CarId(car.getCarId());
        CarDetail detail = details.isEmpty() ? null : details.get(0);
        List<Pricing> pricings = pricingRepository.findByCar_CarId(car.getCarId());
        Pricing pricing = pricings.isEmpty() ? null : pricings.get(0);
        List<String> images = carImageRepository.findByCar_CarId(car.getCarId()).stream()
                .map(CarImage::getImageUrl)
                .toList();
        LocalDateTime[] occupancy = currentOccupancy(car);
        return new CarResponse(
                car.getCarId(),
                car.getCarName(),
                car.getCreatedDate(),
                car.getImageUrl(),
                car.getLocation(),
                car.getQuantity(),
                effectiveStatus(car),
                car.getBrand() != null ? car.getBrand().getBrandId() : null,
                car.getBrand() != null ? car.getBrand().getBrandName() : null,
                car.getCarType() != null ? car.getCarType().getCarTypeId() : null,
                car.getCarType() != null ? car.getCarType().getTypeName() : null,
                car.getLatitude(),
                car.getLongitude(),
                pricing != null ? pricing.getPrice() : null,
                pricing != null ? pricing.getUnit() : null,
                detail != null ? detail.getColor() : null,
                detail != null ? detail.getDescription() : null,
                detail != null ? detail.getEngine() : null,
                detail != null ? detail.getFuelType() : null,
                detail != null ? detail.getLicensePlate() : null,
                detail != null ? detail.getSeatCount() : null,
                detail != null ? detail.getYear() : null,
                images,
                occupancy == null ? null : occupancy[0],
                occupancy == null ? null : occupancy[1]
        );
    }

    /** Khi mọi chỗ đều đang thuê: khoảng của đơn trả sớm nhất — lúc đó khách có thể thuê lại. */
    private LocalDateTime[] currentOccupancy(Car car) {
        if (car.getStatus() == CarStatus.MAINTENANCE) {
            return null;
        }
        int units = car.getQuantity() == null || car.getQuantity() < 1 ? 1 : car.getQuantity();
        List<Booking> occupying = bookingRepository.findByCar_CarId(car.getCarId()).stream()
                .filter(BookingTime::occupiesNow)
                .toList();
        if (occupying.size() < units) {
            return null;
        }
        return occupying.stream()
                .min(Comparator.comparing(BookingTime::endOf))
                .map(booking -> new LocalDateTime[]{BookingTime.startOf(booking), BookingTime.endOf(booking)})
                .orElse(null);
    }

    private String formatRange(LocalDateTime start, LocalDateTime end) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        return start.format(fmt) + " đến " + end.format(fmt);
    }
}
