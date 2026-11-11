
package br.com.tripeasy.dto;

import jakarta.validation.constraints.Size;

public class PreferenciaRequestDTO {

    @Size(max = 100, message = "O estilo de viagem deve ter no máximo 100 caracteres.")
    private String estiloViagem;

    @Size(max = 100, message = "O tipo de hospedagem deve ter no máximo 100 caracteres.")
    private String tipoHospedagem;

    @Size(max = 100, message = "O meio de transporte deve ter no máximo 100 caracteres.")
    private String meioTransporte;

    @Size(max = 255, message = "Os interesses devem ter no máximo 255 caracteres.")
    private String interesses;

    public String getEstiloViagem() {
        return estiloViagem;
    }

    public void setEstiloViagem(String estiloViagem) {
        this.estiloViagem = estiloViagem;
    }

    public String getTipoHospedagem() {
        return tipoHospedagem;
    }

    public void setTipoHospedagem(String tipoHospedagem) {
        this.tipoHospedagem = tipoHospedagem;
    }

    public String getMeioTransporte() {
        return meioTransporte;
    }

    public void setMeioTransporte(String meioTransporte) {
        this.meioTransporte = meioTransporte;
    }

    public String getInteresses() {
        return interesses;
    }

    public void setInteresses(String interesses) {
        this.interesses = interesses;
    }
}
