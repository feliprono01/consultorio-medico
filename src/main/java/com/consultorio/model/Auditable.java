package com.consultorio.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Clase base abstracta para todas las entidades del sistema.
 * Proporciona campos de auditoría y soporte para borrado lógico (soft delete).
 * 
 * Campos de auditoría:
 * - id: Identificador único autogenerado
 * - createdAt: Fecha y hora de creación (automática)
 * - updatedAt: Fecha y hora de última modificación (automática)
 * 
 * Borrado lógico:
 * - active: Indica si el registro está activo (true) o eliminado lógicamente
 * (false)
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    protected LocalDateTime createdAt;

    @org.springframework.data.annotation.CreatedBy
    @Column(name = "created_by", updatable = false)
    protected String createdBy;

    @LastModifiedDate
    @Column(name = "updated_at")
    protected LocalDateTime updatedAt;

    @org.springframework.data.annotation.LastModifiedBy
    @Column(name = "last_modified_by")
    protected String lastModifiedBy;

    @Column(nullable = false)
    protected Boolean active = true;

    public void softDelete() {
        this.active = false;
    }

    public void restore() {
        this.active = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
