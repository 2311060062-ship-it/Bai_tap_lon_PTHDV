package com.example.carrentalbackend.service;

import com.example.carrentalbackend.dto.car.CarRequest;
import com.example.carrentalbackend.enums.CarStatus;
import com.example.carrentalbackend.model.Blog;
import com.example.carrentalbackend.model.Brand;
import com.example.carrentalbackend.model.Car;
import com.example.carrentalbackend.model.CarDetail;
import com.example.carrentalbackend.model.CarType;
import com.example.carrentalbackend.model.User;
import com.example.carrentalbackend.repository.BlogRepository;
import com.example.carrentalbackend.repository.BrandRepository;
import com.example.carrentalbackend.repository.CarDetailRepository;
import com.example.carrentalbackend.repository.CarRepository;
import com.example.carrentalbackend.repository.CarTypeRepository;
import com.example.carrentalbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@Order(2)
public class CatalogSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogSeeder.class);

    private final CarRepository carRepository;
    private final CarDetailRepository carDetailRepository;
    private final BrandRepository brandRepository;
    private final CarTypeRepository carTypeRepository;
    private final CarService carService;
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    public CatalogSeeder(
            CarRepository carRepository,
            CarDetailRepository carDetailRepository,
            BrandRepository brandRepository,
            CarTypeRepository carTypeRepository,
            CarService carService,
            BlogRepository blogRepository,
            UserRepository userRepository
    ) {
        this.carRepository = carRepository;
        this.carDetailRepository = carDetailRepository;
        this.brandRepository = brandRepository;
        this.carTypeRepository = carTypeRepository;
        this.carService = carService;
        this.blogRepository = blogRepository;
        this.userRepository = userRepository;
    }

    private static final double[][] HANOI_POINTS = {
            {21.028511, 105.854187},
            {21.0574, 105.8216},
            {21.0355, 105.8347},
            {21.0442, 105.8804},
            {21.0178, 105.8039},
            {21.0072, 105.8416}
    };

    @Override
    public void run(ApplicationArguments args) {
        seedCars();
        seedCarCoordinates();
        seedNews();
        normalizeVietnameseContent();
    }

    private void seedCars() {
        if (carRepository.count() > 0) {
            return;
        }
        Map<String, Brand> brands = brandRepository.findAll().stream()
                .collect(Collectors.toMap(Brand::getBrandName, Function.identity(), (a, b) -> a));
        Map<String, CarType> types = carTypeRepository.findAll().stream()
                .collect(Collectors.toMap(CarType::getTypeName, Function.identity(), (a, b) -> a));
        if (brands.isEmpty() || types.isEmpty()) {
            log.warn("Bo qua seed xe vi chua co hang/loai. Hay import database/car_rental.sql");
            return;
        }

        record Seed(
                String name, String brand, String type, String location, String color, String engine,
                String fuel, String plate, int seats, int year, int price, String image, String desc
        ) {}

        List<Seed> seeds = List.of(
                new Seed("Toyota Vios 2024", "Toyota", "Sedan", "Hà Nội", "Trắng", "1.5L", "Xăng", "30A-123.45", 5, 2024, 800000,
                        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
                        "Sedan phổ thông, tiết kiệm nhiên liệu, phù hợp đi trong thành phố."),
                new Seed("Honda City RS", "Honda", "Sedan", "Hà Nội", "Đỏ", "1.5L Turbo", "Xăng", "30A-678.90", 5, 2023, 850000,
                        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=80",
                        "Vận hành êm, hộp số CVT, phù hợp gia đình nhỏ."),
                new Seed("Mazda CX-5", "Mazda", "SUV", "Đà Nẵng", "Xanh", "2.0L", "Xăng", "43A-222.11", 5, 2023, 1200000,
                        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80",
                        "SUV gầm cao, an toàn, thích hợp đi tỉnh và du lịch."),
                new Seed("Hyundai Accent", "Hyundai", "Sedan", "TP.HCM", "Bạc", "1.4L", "Xăng", "51A-333.22", 5, 2022, 750000,
                        "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80",
                        "Chi phí thuê hợp lý, dễ lái trong phố."),
                new Seed("Ford Ranger Wildtrak", "Ford", "Pickup", "Hà Nội", "Cam", "2.0L Bi-Turbo", "Dầu", "29C-444.55", 5, 2023, 1500000,
                        "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
                        "Bán tải mạnh, kéo hàng, đi địa hình tốt."),
                new Seed("Mercedes-Benz C300", "Mercedes-Benz", "Sedan", "TP.HCM", "Đen", "2.0L", "Xăng", "51A-999.88", 5, 2024, 2500000,
                        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
                        "Hạng sang, nội thất da, phù hợp đón khách và sự kiện.")
        );

        int created = 0;
        for (Seed seed : seeds) {
            Brand brand = brands.get(seed.brand());
            CarType type = types.get(seed.type());
            if (brand == null || type == null) {
                continue;
            }
            carService.create(new CarRequest(
                    seed.name(),
                    seed.location(),
                    1,
                    CarStatus.AVAILABLE,
                    brand.getBrandId(),
                    type.getCarTypeId(),
                    seed.image(),
                    HANOI_POINTS[created % HANOI_POINTS.length][0],
                    HANOI_POINTS[created % HANOI_POINTS.length][1],
                    seed.color(),
                    seed.desc(),
                    seed.engine(),
                    seed.fuel(),
                    seed.plate(),
                    seed.seats(),
                    seed.year(),
                    BigDecimal.valueOf(seed.price()),
                    "DAY"
            ));
            created++;
        }
        log.info("Da seed {} xe mau de demo danh sach / chi tiet / dat xe", created);
    }

    private void seedCarCoordinates() {
        var cars = carRepository.findAll();
        int updated = 0;
        int index = 0;
        for (Car car : cars) {
            if (car.getLatitude() == null || car.getLongitude() == null) {
                double[] point = HANOI_POINTS[index % HANOI_POINTS.length];
                car.setLatitude(point[0]);
                car.setLongitude(point[1]);
                carRepository.save(car);
                updated++;
                index++;
            }
        }
        if (updated > 0) {
            log.info("Da gan toa do ban do cho {} xe", updated);
        }
    }

    private void seedNews() {
        if (blogRepository.count() > 0) {
            return;
        }
        User admin = userRepository.findByUserName("admin").orElse(null);
        if (admin == null) {
            return;
        }
        List<Blog> posts = List.of(
                news(admin, "Hướng dẫn thuê xe tự lái 3 bước",
                        "1. Chọn địa điểm và ngày nhận/trả xe.\n2. Lọc xe theo hãng, loại, giá rồi xem chi tiết.\n3. Đặt xe, thanh toán cọc 30% hoặc trả đủ, theo dõi đơn trên website."),
                news(admin, "Quy định đặt cọc và thanh toán",
                        "Hệ thống tính tiền theo ngày. Khi đặt xe, khách có thể thanh toán cọc 30% tổng tiền hoặc thanh toán đủ. Quản trị viên duyệt đơn sau khi nhận thanh toán giả lập (tiền mặt / chuyển khoản / MoMo)."),
                news(admin, "Giấy tờ cần mang khi nhận xe",
                        "Khách hàng mang CCCD, giấy phép lái xe hạng B2 trở lên và đúng thời gian nhận xe đã đặt. Biển số và tình trạng xe được ghi trong chi tiết từng mẫu xe.")
        );
        blogRepository.saveAll(posts);
        log.info("Da seed {} bai tin tuc mau", posts.size());
    }

    private void normalizeVietnameseContent() {
        int newsUpdated = 0;
        for (Blog blog : blogRepository.findAll()) {
            String title = blog.getTitle();
            if ("Huong dan thue xe tu lai 3 buoc".equals(title)) {
                blog.setTitle("Hướng dẫn thuê xe tự lái 3 bước");
                blog.setContent("1. Chọn địa điểm và ngày nhận/trả xe.\n2. Lọc xe theo hãng, loại, giá rồi xem chi tiết.\n3. Đặt xe, thanh toán cọc 30% hoặc trả đủ, theo dõi đơn trên website.");
                blogRepository.save(blog);
                newsUpdated++;
            } else if ("Quy dinh dat coc va thanh toan".equals(title)) {
                blog.setTitle("Quy định đặt cọc và thanh toán");
                blog.setContent("Hệ thống tính tiền theo ngày. Khi đặt xe, khách có thể thanh toán cọc 30% tổng tiền hoặc thanh toán đủ. Quản trị viên duyệt đơn sau khi nhận thanh toán giả lập (tiền mặt / chuyển khoản / MoMo).");
                blogRepository.save(blog);
                newsUpdated++;
            } else if ("Giay to can mang khi nhan xe".equals(title)) {
                blog.setTitle("Giấy tờ cần mang khi nhận xe");
                blog.setContent("Khách hàng mang CCCD, giấy phép lái xe hạng B2 trở lên và đúng thời gian nhận xe đã đặt. Biển số và tình trạng xe được ghi trong chi tiết từng mẫu xe.");
                blogRepository.save(blog);
                newsUpdated++;
            }
        }

        int carUpdated = 0;
        for (Car car : carRepository.findAll()) {
            boolean changed = false;
            String location = car.getLocation();
            if (location != null) {
                String lower = location.toLowerCase();
                if (lower.equals("ha noi") || lower.equals("hanoi")) {
                    car.setLocation("Hà Nội");
                    changed = true;
                } else if (lower.equals("da nang") || lower.equals("danang")) {
                    car.setLocation("Đà Nẵng");
                    changed = true;
                }
            }
            if (changed) {
                carRepository.save(car);
                carUpdated++;
            }
        }
        if (newsUpdated > 0 || carUpdated > 0) {
            log.info("Da chuan hoa tieng Viet: {} tin tuc, {} xe", newsUpdated, carUpdated);
        }

        for (CarDetail detail : carDetailRepository.findAll()) {
            boolean changed = false;
            if ("Xang".equalsIgnoreCase(detail.getFuelType())) {
                detail.setFuelType("Xăng");
                changed = true;
            } else if ("Dau".equalsIgnoreCase(detail.getFuelType())) {
                detail.setFuelType("Dầu");
                changed = true;
            }
            if ("Trang".equalsIgnoreCase(detail.getColor())) {
                detail.setColor("Trắng");
                changed = true;
            } else if ("Do".equalsIgnoreCase(detail.getColor())) {
                detail.setColor("Đỏ");
                changed = true;
            } else if ("Bac".equalsIgnoreCase(detail.getColor())) {
                detail.setColor("Bạc");
                changed = true;
            } else if ("Den".equalsIgnoreCase(detail.getColor())) {
                detail.setColor("Đen");
                changed = true;
            }
            if (detail.getDescription() != null && detail.getDescription().equals("Sedan pho thong, tiet kiem nhien lieu, phu hop di trong thanh pho.")) {
                detail.setDescription("Sedan phổ thông, tiết kiệm nhiên liệu, phù hợp đi trong thành phố.");
                changed = true;
            } else if (detail.getDescription() != null && detail.getDescription().equals("Van hanh em, hop so CVT, phu hop gia dinh nho.")) {
                detail.setDescription("Vận hành êm, hộp số CVT, phù hợp gia đình nhỏ.");
                changed = true;
            } else if (detail.getDescription() != null && detail.getDescription().equals("SUV gam cao, an toan, thich hop di tinh va du lich.")) {
                detail.setDescription("SUV gầm cao, an toàn, thích hợp đi tỉnh và du lịch.");
                changed = true;
            } else if (detail.getDescription() != null && detail.getDescription().equals("Chi phi thue hop ly, de lai trong pho.")) {
                detail.setDescription("Chi phí thuê hợp lý, dễ lái trong phố.");
                changed = true;
            } else if (detail.getDescription() != null && detail.getDescription().equals("Ban tai manh, keo hang, di dia hinh tot.")) {
                detail.setDescription("Bán tải mạnh, kéo hàng, đi địa hình tốt.");
                changed = true;
            } else if (detail.getDescription() != null && detail.getDescription().equals("Hang sang, noi that da, phu hop don khach va su kien.")) {
                detail.setDescription("Hạng sang, nội thất da, phù hợp đón khách và sự kiện.");
                changed = true;
            }
            if (changed) {
                carDetailRepository.save(detail);
            }
        }
    }

    private Blog news(User author, String title, String content) {
        Blog blog = new Blog();
        blog.setUser(author);
        blog.setTitle(title);
        blog.setContent(content);
        blog.setCreatedAt(LocalDateTime.now());
        return blog;
    }
}
