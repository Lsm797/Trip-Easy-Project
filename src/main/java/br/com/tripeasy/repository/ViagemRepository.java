package br.com.tripeasy.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.tripeasy.model.Viagem;


public interface ViagemRepository extends JpaRepository<Viagem, Long> {
    List<Viagem> findAllByUsuario_Id(Long usuarioId);

    Optional<Viagem> findByIdAndUsuario_Id(Long id, Long usuarioId);

}
