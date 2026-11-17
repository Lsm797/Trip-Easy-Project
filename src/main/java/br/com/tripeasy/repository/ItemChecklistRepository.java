package br.com.tripeasy.repository;

import br.com.tripeasy.model.ItemChecklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemChecklistRepository extends JpaRepository<ItemChecklist, Long> {

    List<ItemChecklist> findByViagem_IdOrderByIdAsc(Long viagemId);

    // Só devolve o item se a viagem dele for do usuário informado
    Optional<ItemChecklist> findByIdAndViagem_Usuario_Id(Long id, Long usuarioId);
}
