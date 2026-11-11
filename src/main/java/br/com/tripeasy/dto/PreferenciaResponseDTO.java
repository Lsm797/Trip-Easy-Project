package br.com.tripeasy.dto;

import br.com.tripeasy.model.Preferencia;

public class PreferenciaResponseDTO {

    private Long id;
    private String estiloViagem;
    private String tipoHospedagem;
    private String meioTransporte;
    private String interesses;

    public PreferenciaResponseDTO(Preferencia preferencia) {
        this.id = preferencia.getId();
        this.estiloViagem = preferencia.getEstiloViagem();
        this.tipoHospedagem = preferencia.getTipoHospedagem();
        this.meioTransporte = preferencia.getMeioTransporte();
        this.interesses = preferencia.getInteresses();
    }

    public Long getId() {
        return id;
    }

    public String getEstiloViagem() {
        return estiloViagem;
    }

    public String getTipoHospedagem() {
        return tipoHospedagem;
    }

    public String getMeioTransporte() {
        return meioTransporte;
    }

    public String getInteresses() {
        return interesses;
    }
}