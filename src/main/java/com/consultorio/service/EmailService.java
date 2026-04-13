package com.consultorio.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class EmailService {

    @Autowired(required = false) // Optional so app doesn't crash if mail config is missing
    private JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmailWithAttachment(String to, String subject, String text, String pathToAttachment) {
        if (emailSender == null) {
            System.out.println("EmailService: MailSender not configured. Skipping email.");
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
            System.out.println("EmailService: Email sent successfully to " + to);

        } catch (MessagingException e) {
            System.err.println("EmailService: Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
