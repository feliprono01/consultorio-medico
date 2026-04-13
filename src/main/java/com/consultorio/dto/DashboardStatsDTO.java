package com.consultorio.dto;

public class DashboardStatsDTO {
    private long totalPacientes;
    private long consultasHoy;
    private String ultimaConsulta;
    private String pacienteUltimaConsulta;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(long totalPacientes, long consultasHoy, String ultimaConsulta,
            String pacienteUltimaConsulta) {
        this.totalPacientes = totalPacientes;
        this.consultasHoy = consultasHoy;
        this.ultimaConsulta = ultimaConsulta;
        this.pacienteUltimaConsulta = pacienteUltimaConsulta;
    }

    public long getTotalPacientes() {
        return totalPacientes;
    }

    public void setTotalPacientes(long totalPacientes) {
        this.totalPacientes = totalPacientes;
    }

    public long getConsultasHoy() {
        return consultasHoy;
    }

    public void setConsultasHoy(long consultasHoy) {
        this.consultasHoy = consultasHoy;
    }

    public String getUltimaConsulta() {
        return ultimaConsulta;
    }

    public void setUltimaConsulta(String ultimaConsulta) {
        this.ultimaConsulta = ultimaConsulta;
    }

    public String getPacienteUltimaConsulta() {
        return pacienteUltimaConsulta;
    }

    public void setPacienteUltimaConsulta(String pacienteUltimaConsulta) {
        this.pacienteUltimaConsulta = pacienteUltimaConsulta;
    }

    public static DashboardStatsDTOBuilder builder() {
        return new DashboardStatsDTOBuilder();
    }

    public static class DashboardStatsDTOBuilder {
        private long totalPacientes;
        private long consultasHoy;
        private String ultimaConsulta;
        private String pacienteUltimaConsulta;

        public DashboardStatsDTOBuilder totalPacientes(long totalPacientes) {
            this.totalPacientes = totalPacientes;
            return this;
        }

        public DashboardStatsDTOBuilder consultasHoy(long consultasHoy) {
            this.consultasHoy = consultasHoy;
            return this;
        }

        public DashboardStatsDTOBuilder ultimaConsulta(String ultimaConsulta) {
            this.ultimaConsulta = ultimaConsulta;
            return this;
        }

        public DashboardStatsDTOBuilder pacienteUltimaConsulta(String pacienteUltimaConsulta) {
            this.pacienteUltimaConsulta = pacienteUltimaConsulta;
            return this;
        }

        public DashboardStatsDTO build() {
            return new DashboardStatsDTO(totalPacientes, consultasHoy, ultimaConsulta, pacienteUltimaConsulta);
        }
    }
}
