package com.consultorio.model;

import jakarta.persistence.*;
import com.consultorio.security.AttributeEncryptor;

@Entity
@Table(name = "historias_psiquiatricas")
public class HistoriaPsiquiatrica extends Auditable {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false, unique = true)
    private Paciente paciente;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String antecedentesFamiliares;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String antecedentesPersonales;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String historiaConsumo;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String enfermedadActual;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String tratamientosPrevios;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String desarrolloPsicomotor;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String personalidadPrevia;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String antecedentesPsicologicos;

    /** Historia sexual del paciente — parte de la "Historia Personal" clásica de la anamnesis psiquiátrica. */
    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String historiaSexual;

    /** Historia marital / vínculo de pareja actual. */
    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String historiaMarital;

    /** Hábitos generales (tabaco, alcohol, cafeína, etc.) — distinto de historiaConsumo,
     *  que apunta a consumo problemático de sustancias. */
    @Column(columnDefinition = "TEXT")
    @Convert(converter = AttributeEncryptor.class)
    private String habitos;


    public HistoriaPsiquiatrica() {
    }

    public HistoriaPsiquiatrica(Paciente paciente, String antecedentesFamiliares, String antecedentesPersonales,
            String historiaConsumo, String enfermedadActual, String tratamientosPrevios, String desarrolloPsicomotor,
            String personalidadPrevia, String antecedentesPsicologicos, String historiaSexual,
            String historiaMarital, String habitos) {
        this.paciente = paciente;
        this.antecedentesFamiliares = antecedentesFamiliares;
        this.antecedentesPersonales = antecedentesPersonales;
        this.historiaConsumo = historiaConsumo;
        this.enfermedadActual = enfermedadActual;
        this.tratamientosPrevios = tratamientosPrevios;
        this.desarrolloPsicomotor = desarrolloPsicomotor;
        this.personalidadPrevia = personalidadPrevia;
        this.antecedentesPsicologicos = antecedentesPsicologicos;
        this.historiaSexual = historiaSexual;
        this.historiaMarital = historiaMarital;
        this.habitos = habitos;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public String getAntecedentesFamiliares() {
        return antecedentesFamiliares;
    }

    public void setAntecedentesFamiliares(String antecedentesFamiliares) {
        this.antecedentesFamiliares = antecedentesFamiliares;
    }

    public String getAntecedentesPersonales() {
        return antecedentesPersonales;
    }

    public void setAntecedentesPersonales(String antecedentesPersonales) {
        this.antecedentesPersonales = antecedentesPersonales;
    }

    public String getHistoriaConsumo() {
        return historiaConsumo;
    }

    public void setHistoriaConsumo(String historiaConsumo) {
        this.historiaConsumo = historiaConsumo;
    }

    public String getEnfermedadActual() {
        return enfermedadActual;
    }

    public void setEnfermedadActual(String enfermedadActual) {
        this.enfermedadActual = enfermedadActual;
    }

    public String getTratamientosPrevios() {
        return tratamientosPrevios;
    }

    public void setTratamientosPrevios(String tratamientosPrevios) {
        this.tratamientosPrevios = tratamientosPrevios;
    }

    public String getDesarrolloPsicomotor() {
        return desarrolloPsicomotor;
    }

    public void setDesarrolloPsicomotor(String desarrolloPsicomotor) {
        this.desarrolloPsicomotor = desarrolloPsicomotor;
    }

    public String getPersonalidadPrevia() {
        return personalidadPrevia;
    }

    public void setPersonalidadPrevia(String personalidadPrevia) {
        this.personalidadPrevia = personalidadPrevia;
    }

    public String getAntecedentesPsicologicos() {
        return antecedentesPsicologicos;
    }

    public void setAntecedentesPsicologicos(String antecedentesPsicologicos) {
        this.antecedentesPsicologicos = antecedentesPsicologicos;
    }

    public String getHistoriaSexual() {
        return historiaSexual;
    }

    public void setHistoriaSexual(String historiaSexual) {
        this.historiaSexual = historiaSexual;
    }

    public String getHistoriaMarital() {
        return historiaMarital;
    }

    public void setHistoriaMarital(String historiaMarital) {
        this.historiaMarital = historiaMarital;
    }

    public String getHabitos() {
        return habitos;
    }

    public void setHabitos(String habitos) {
        this.habitos = habitos;
    }

    public static HistoriaPsiquiatricaBuilder builder() {
        return new HistoriaPsiquiatricaBuilder();
    }

    public static class HistoriaPsiquiatricaBuilder {
        private Paciente paciente;
        private String antecedentesFamiliares;
        private String antecedentesPersonales;
        private String historiaConsumo;
        private String enfermedadActual;
        private String tratamientosPrevios;
        private String desarrolloPsicomotor;
        private String personalidadPrevia;
        private String antecedentesPsicologicos;
        private String historiaSexual;
        private String historiaMarital;
        private String habitos;

        public HistoriaPsiquiatricaBuilder paciente(Paciente paciente) {
            this.paciente = paciente;
            return this;
        }

        public HistoriaPsiquiatricaBuilder antecedentesFamiliares(String antecedentesFamiliares) {
            this.antecedentesFamiliares = antecedentesFamiliares;
            return this;
        }

        public HistoriaPsiquiatricaBuilder antecedentesPersonales(String antecedentesPersonales) {
            this.antecedentesPersonales = antecedentesPersonales;
            return this;
        }

        public HistoriaPsiquiatricaBuilder historiaConsumo(String historiaConsumo) {
            this.historiaConsumo = historiaConsumo;
            return this;
        }

        public HistoriaPsiquiatricaBuilder enfermedadActual(String enfermedadActual) {
            this.enfermedadActual = enfermedadActual;
            return this;
        }

        public HistoriaPsiquiatricaBuilder tratamientosPrevios(String tratamientosPrevios) {
            this.tratamientosPrevios = tratamientosPrevios;
            return this;
        }

        public HistoriaPsiquiatricaBuilder desarrolloPsicomotor(String desarrolloPsicomotor) {
            this.desarrolloPsicomotor = desarrolloPsicomotor;
            return this;
        }

        public HistoriaPsiquiatricaBuilder personalidadPrevia(String personalidadPrevia) {
            this.personalidadPrevia = personalidadPrevia;
            return this;
        }

        public HistoriaPsiquiatricaBuilder antecedentesPsicologicos(String antecedentesPsicologicos) {
            this.antecedentesPsicologicos = antecedentesPsicologicos;
            return this;
        }

        public HistoriaPsiquiatricaBuilder historiaSexual(String historiaSexual) {
            this.historiaSexual = historiaSexual;
            return this;
        }

        public HistoriaPsiquiatricaBuilder historiaMarital(String historiaMarital) {
            this.historiaMarital = historiaMarital;
            return this;
        }

        public HistoriaPsiquiatricaBuilder habitos(String habitos) {
            this.habitos = habitos;
            return this;
        }

        public HistoriaPsiquiatrica build() {
            return new HistoriaPsiquiatrica(paciente, antecedentesFamiliares, antecedentesPersonales, historiaConsumo,
                    enfermedadActual, tratamientosPrevios, desarrolloPsicomotor, personalidadPrevia,
                    antecedentesPsicologicos, historiaSexual, historiaMarital, habitos);
        }
    }
}
