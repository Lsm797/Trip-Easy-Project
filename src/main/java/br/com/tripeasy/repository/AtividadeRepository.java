package br.com.tripeasy.repository;

import br.com.tripeasy.model.Atividade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AtividadeRepository extends JpaRepository<Atividade, Long> {

    List<Atividade> findByViagem_Id(Long viagemId);

    List<Atividade> findByViagem_IdAndData(Long viagemId, LocalDate data);

    // Só devolve a atividade se a viagem dela for do usuário informado
    Optional<Atividade> findByIdAndViagem_Usuario_Id(Long id, Long usuarioId);
}
