package br.com.tripeasy.dto;

import java.time.LocalDate;
import java.util.List;

/** Um dia do roteiro com suas atividades já ordenadas por horário. */
public record AtividadeDiaResponse(
        LocalDate data,
        List<AtividadeResponse> atividades
) {
}
