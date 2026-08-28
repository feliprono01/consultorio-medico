package com.consultorio.dto;

/**
 * Resultado de recorrer y recalcular una cadena de integridad de auditoría
 * (ver security.HashChainUtil). Si `intacta` es false, `primerRegistroRoto`
 * indica el ID de la primera fila cuyo hash no coincide con lo esperado —
 * a partir de ahí (inclusive) el historial no se puede dar por confiable.
 */
public class VerificacionCadenaDTO {

    private boolean intacta;
    private long totalRegistros;
    private Long primerRegistroRoto;

    public VerificacionCadenaDTO() {
    }

    public VerificacionCadenaDTO(boolean intacta, long totalRegistros, Long primerRegistroRoto) {
        this.intacta = intacta;
        this.totalRegistros = totalRegistros;
        this.primerRegistroRoto = primerRegistroRoto;
    }

    public boolean isIntacta() {
        return intacta;
    }

    public void setIntacta(boolean intacta) {
        this.intacta = intacta;
    }

    public long getTotalRegistros() {
        return totalRegistros;
    }

    public void setTotalRegistros(long totalRegistros) {
        this.totalRegistros = totalRegistros;
    }

    public Long getPrimerRegistroRoto() {
        return primerRegistroRoto;
    }

    public void setPrimerRegistroRoto(Long primerRegistroRoto) {
        this.primerRegistroRoto = primerRegistroRoto;
    }
}
