package br.com.tripeasy.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.tripeasy.model.Preferencia;

public interface PreferenciaRepository extends JpaRepository<Preferencia, Long> {

    Optional<Preferencia> findByUsuarioId(Long usuarioId);

}