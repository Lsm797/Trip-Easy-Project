package br.com.tripeasy.repository;

import br.com.tripeasy.model.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    List<Despesa> findByViagem_IdOrderByDataDescIdDesc(Long viagemId);

    // Só devolve a despesa se a viagem dela for do usuário informado
    Optional<Despesa> findByIdAndViagem_Usuario_Id(Long id, Long usuarioId);

    // Total gasto na viagem (0 quando não há despesas)
    @Query("SELECT COALESCE(SUM(d.valor), 0) FROM Despesa d WHERE d.viagem.id = :viagemId")
    BigDecimal somaTotalPorViagem(@Param("viagemId") Long viagemId);

    // Total por categoria: cada linha = [CategoriaDespesa, BigDecimal]
    @Query("SELECT d.categoria, SUM(d.valor) FROM Despesa d WHERE d.viagem.id = :viagemId GROUP BY d.categoria")
    List<Object[]> somaPorCategoria(@Param("viagemId") Long viagemId);
}
