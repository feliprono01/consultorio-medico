package com.consultorio.dto;

public class EvaluacionPsiquiatricaDTO {
    private Long id;
    private String apariencia;
    private String conducta;
    private String lenguaje;
    private String animo;
    private String afecto;
    private String pensamiento;
    private String sensopercepcion;
    private String juicio;
    private String memoria;
    private String atencion;
    private String riesgoSuicida;
    private String riesgoHomicida;
    private String riesgoPropio;
    private String conciencia;
    private String eje1;
    private String eje2;
    private String eje3;
    private String adherenciaTratamiento;
    private String efectosAdversos;

    public EvaluacionPsiquiatricaDTO() {
    }

    public EvaluacionPsiquiatricaDTO(Long id, String apariencia, String conducta, String lenguaje, String animo,
            String afecto, String pensamiento, String sensopercepcion, String juicio, String memoria, String atencion,
            String riesgoSuicida, String riesgoHomicida, String riesgoPropio, String conciencia, String eje1,
            String eje2, String eje3, String adherenciaTratamiento, String efectosAdversos) {
        this.id = id;
        this.apariencia = apariencia;
        this.conducta = conducta;
        this.lenguaje = lenguaje;
        this.animo = animo;
        this.afecto = afecto;
        this.pensamiento = pensamiento;
        this.sensopercepcion = sensopercepcion;
        this.juicio = juicio;
        this.memoria = memoria;
        this.atencion = atencion;
        this.riesgoSuicida = riesgoSuicida;
        this.riesgoHomicida = riesgoHomicida;
        this.riesgoPropio = riesgoPropio;
        this.conciencia = conciencia;
        this.eje1 = eje1;
        this.eje2 = eje2;
        this.eje3 = eje3;
        this.adherenciaTratamiento = adherenciaTratamiento;
        this.efectosAdversos = efectosAdversos;
    }

    public static EvaluacionPsiquiatricaDTOBuilder builder() {
        return new EvaluacionPsiquiatricaDTOBuilder();
    }

    public static class EvaluacionPsiquiatricaDTOBuilder {
        private Long id;
        private String apariencia;
        private String conducta;
        private String lenguaje;
        private String animo;
        private String afecto;
        private String pensamiento;
        private String sensopercepcion;
        private String juicio;
        private String memoria;
        private String atencion;
        private String riesgoSuicida;
        private String riesgoHomicida;
        private String riesgoPropio;
        private String conciencia;
        private String eje1;
        private String eje2;
        private String eje3;
        private String adherenciaTratamiento;
        private String efectosAdversos;

        public EvaluacionPsiquiatricaDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder apariencia(String apariencia) {
            this.apariencia = apariencia;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder conducta(String conducta) {
            this.conducta = conducta;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder lenguaje(String lenguaje) {
            this.lenguaje = lenguaje;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder animo(String animo) {
            this.animo = animo;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder afecto(String afecto) {
            this.afecto = afecto;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder pensamiento(String pensamiento) {
            this.pensamiento = pensamiento;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder sensopercepcion(String sensopercepcion) {
            this.sensopercepcion = sensopercepcion;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder juicio(String juicio) {
            this.juicio = juicio;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder memoria(String memoria) {
            this.memoria = memoria;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder atencion(String atencion) {
            this.atencion = atencion;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder riesgoSuicida(String riesgoSuicida) {
            this.riesgoSuicida = riesgoSuicida;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder riesgoHomicida(String riesgoHomicida) {
            this.riesgoHomicida = riesgoHomicida;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder riesgoPropio(String riesgoPropio) {
            this.riesgoPropio = riesgoPropio;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder conciencia(String conciencia) {
            this.conciencia = conciencia;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder eje1(String eje1) {
            this.eje1 = eje1;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder eje2(String eje2) {
            this.eje2 = eje2;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder eje3(String eje3) {
            this.eje3 = eje3;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder adherenciaTratamiento(String adherenciaTratamiento) {
            this.adherenciaTratamiento = adherenciaTratamiento;
            return this;
        }

        public EvaluacionPsiquiatricaDTOBuilder efectosAdversos(String efectosAdversos) {
            this.efectosAdversos = efectosAdversos;
            return this;
        }

        public EvaluacionPsiquiatricaDTO build() {
            return new EvaluacionPsiquiatricaDTO(id, apariencia, conducta, lenguaje, animo, afecto, pensamiento,
                    sensopercepcion, juicio, memoria, atencion, riesgoSuicida, riesgoHomicida, riesgoPropio, conciencia,
                    eje1, eje2, eje3, adherenciaTratamiento, efectosAdversos);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApariencia() {
        return apariencia;
    }

    public void setApariencia(String apariencia) {
        this.apariencia = apariencia;
    }

    public String getConducta() {
        return conducta;
    }

    public void setConducta(String conducta) {
        this.conducta = conducta;
    }

    public String getLenguaje() {
        return lenguaje;
    }

    public void setLenguaje(String lenguaje) {
        this.lenguaje = lenguaje;
    }

    public String getAnimo() {
        return animo;
    }

    public void setAnimo(String animo) {
        this.animo = animo;
    }

    public String getAfecto() {
        return afecto;
    }

    public void setAfecto(String afecto) {
        this.afecto = afecto;
    }

    public String getPensamiento() {
        return pensamiento;
    }

    public void setPensamiento(String pensamiento) {
        this.pensamiento = pensamiento;
    }

    public String getSensopercepcion() {
        return sensopercepcion;
    }

    public void setSensopercepcion(String sensopercepcion) {
        this.sensopercepcion = sensopercepcion;
    }

    public String getJuicio() {
        return juicio;
    }

    public void setJuicio(String juicio) {
        this.juicio = juicio;
    }

    public String getMemoria() {
        return memoria;
    }

    public void setMemoria(String memoria) {
        this.memoria = memoria;
    }

    public String getAtencion() {
        return atencion;
    }

    public void setAtencion(String atencion) {
        this.atencion = atencion;
    }

    public String getRiesgoSuicida() {
        return riesgoSuicida;
    }

    public void setRiesgoSuicida(String riesgoSuicida) {
        this.riesgoSuicida = riesgoSuicida;
    }

    public String getRiesgoHomicida() {
        return riesgoHomicida;
    }

    public void setRiesgoHomicida(String riesgoHomicida) {
        this.riesgoHomicida = riesgoHomicida;
    }

    public String getRiesgoPropio() {
        return riesgoPropio;
    }

    public void setRiesgoPropio(String riesgoPropio) {
        this.riesgoPropio = riesgoPropio;
    }

    public String getConciencia() {
        return conciencia;
    }

    public void setConciencia(String conciencia) {
        this.conciencia = conciencia;
    }

    public String getEje1() {
        return eje1;
    }

    public void setEje1(String eje1) {
        this.eje1 = eje1;
    }

    public String getEje2() {
        return eje2;
    }

    public void setEje2(String eje2) {
        this.eje2 = eje2;
    }

    public String getEje3() {
        return eje3;
    }

    public void setEje3(String eje3) {
        this.eje3 = eje3;
    }

    public String getAdherenciaTratamiento() {
        return adherenciaTratamiento;
    }

    public void setAdherenciaTratamiento(String adherenciaTratamiento) {
        this.adherenciaTratamiento = adherenciaTratamiento;
    }

    public String getEfectosAdversos() {
        return efectosAdversos;
    }

    public void setEfectosAdversos(String efectosAdversos) {
        this.efectosAdversos = efectosAdversos;
    }
}
