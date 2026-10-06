package com.example.carrentalbackend.service;

import com.example.carrentalbackend.exception.ApiException;
import com.example.carrentalbackend.model.User;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;

@Service
public class MailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public MailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from:}") String fromAddress,
            @Value("${spring.mail.username:}") String mailUsername
    ) {
        this.mailSender = mailSender;
        this.fromAddress = StringUtils.hasText(fromAddress) ? fromAddress : mailUsername;
    }

    public void sendOtpEmail(User user, String otp) {
        if (!StringUtils.hasText(fromAddress)) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình SMTP. Hãy điền MAIL_USERNAME trong application-local.properties");
        }
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
                  <h2 style="color:#00b4d8;margin-bottom:8px">Mã OTP xác thực CarRental</h2>
                  <p>Xin chào <b>%s</b>,</p>
                  <p>Mã OTP để xác thực tài khoản của bạn là:</p>
                  <p style="margin:24px 0;text-align:center">
                    <span style="display:inline-block;letter-spacing:8px;font-size:32px;font-weight:800;color:#041428;background:linear-gradient(135deg,#00ffc8,#00b4d8);padding:14px 22px;border-radius:12px">
                      %s
                    </span>
                  </p>
                  <p style="font-size:13px;color:#64748b">Mã có hiệu lực 120 giây. Không chia sẻ mã này cho người khác.</p>
                </div>
                """.formatted(user.getUserFullName(), otp);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(fromAddress, "CarRental");
            helper.setTo(user.getUserEmail());
            helper.setSubject("Mã OTP xác thực tài khoản CarRental");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Không gửi được mã OTP. Kiểm tra SMTP Gmail: " + ex.getMessage());
        }
    }
}
