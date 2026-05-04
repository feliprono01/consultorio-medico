package com.consultorio.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Slf4j
@Service
public class EmailService {

    @Autowired(required = false) // Optional so app doesn't crash if mail config is missing
    private JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmailWithAttachment(String to, String subject, String text, String pathToAttachment) {
        if (emailSender == null) {
            log.warn("EmailService: MailSender no configurado. El backup no se enviará por email.");
            return;
        }

        MimeMessage message = emailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);

            FileSystemResource file = new FileSystemResource(new File(pathToAttachment));
            helper.addAttachment(file.getFilename(), file);

            emailSender.send(message);
            log.info("EmailService: Email enviado exitosamente a {}", to);

        } catch (MessagingException e) {
            log.error("EmailService: Error al enviar el email a {}: {}", to, e.getMessage(), e);
        }
    }
}
