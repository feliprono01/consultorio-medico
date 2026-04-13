package com.consultorio.dto;

public class HistoriaPsiquiatricaDTO {
    private Long id;
    private String antecedentesFamiliares;
    private String antecedentesPersonales;
    private String historiaConsumo;
    private String enfermedadActual;
    private String tratamientosPrevios;
    private String desarrolloPsicomotor;
    private String personalidadPrevia;
    private String antecedentesPsicologicos;

    public HistoriaPsiquiatricaDTO() {
    }

    public HistoriaPsiquiatricaDTO(Long id, String antecedentesFamiliares, String antecedentesPersonales,
            String historiaConsumo, String enfermedadActual, String tratamientosPrevios, String desarrolloPsicomotor,
            String personalidadPrevia, String antecedentesPsicologicos) {
        this.id = id;
        this.antecedentesFamiliares = antecedentesFamiliares;
        this.antecedentesPersonales = antecedentesPersonales;
        this.historiaConsumo = historiaConsumo;
        this.enfermedadActual = enfermedadActual;
        this.tratamientosPrevios = tratamientosPrevios;
        this.desarrolloPsicomotor = desarrolloPsicomotor;
        this.personalidadPrevia = personalidadPrevia;
        this.antecedentesPsicologicos = antecedentesPsicologicos;
    }

    public static HistoriaPsiquiatricaDTOBuilder builder() {
        return new HistoriaPsiquiatricaDTOBuilder();
    }

    public static class HistoriaPsiquiatricaDTOBuilder {
        private Long id;
        private String antecedentesFamiliares;
        private String antecedentesPersonales;
        private String historiaConsumo;
        private String enfermedadActual;
        private String tratamientosPrevios;
        private String desarrolloPsicomotor;
        private String personalidadPrevia;
        private String antecedentesPsicologicos;

        public HistoriaPsiquiatricaDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HistoriaPsiquiatricaDTOBuilder antecedentesFamiliares(String antecedentesFamiliares) {
            this.antecedentesFamiliares = antecedentesFamiliares;
            return this;
        }

        public HistoriaPsiquiatricaDTOBuilder antecedentesPersonales(String antecedentesPersonales) {
            this.antecedentesPersonales = antecedentesPersonales;
            return this;
        }

        public HistoriaPsiquiatricaDTOBuilder historiaConsumo(String historiaConsumo) {
            this.historiaConsumo = historiaConsumo;
            return this;
        }

        public HistoriaPsiquiatricaDTOBuilder enfermedadActual(String enfermedadActual) {
            this.enfermedadActual = enfermedadActual;
            return this;
        }

        public HistoriaPsiquiatricaDTOBuilder tratamientosPrevios(String tratamientosPrevios) {
            this.tratamientosPrevios = tratamientosPrevios;
            return this;
        }

        public HistoriaPsiquiatricaDTOBuilder desarrolloPsicomotor(String desarrolloPsicomotor) {
            this.desarrolloPsicomotor = desarrolloPsicomotor;
            return this;
        }

        public HistoriaPsiquiatricaDTOBuilder personalidadPrevia(String personalidadPrevia) {
            this.personalidadPrevia = personalidadPrevia;
            return this;
        }

        public HistoriaPsiquiatricaDTOBuilder antecedentesPsicologicos(String antecedentesPsicologicos) {
            this.antecedentesPsicologicos = antecedentesPsicologicos;
            return this;
        }

        public HistoriaPsiquiatricaDTO build() {
            return new HistoriaPsiquiatricaDTO(id, antecedentesFamiliares, antecedentesPersonales, historiaConsumo,
                    enfermedadActual, tratamientosPrevios, desarrolloPsicomotor, personalidadPrevia,
                    antecedentesPsicologicos);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
