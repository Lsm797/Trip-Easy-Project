package br.com.tripeasy.dto;

import br.com.tripeasy.model.CategoriaDespesa;

import java.math.BigDecimal;
import java.util.Map;

/** Dados financeiros do Dashboard de uma viagem. */
public record ResumoDespesasResponse(
        BigDecimal orcamento,
        BigDecimal totalGasto,
        BigDecimal saldoRestante,
        boolean orcamentoUltrapassado,
        Map<CategoriaDespesa, BigDecimal> totalPorCategoria) {}
