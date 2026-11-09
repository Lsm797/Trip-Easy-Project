package br.com.tripeasy.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.tripeasy.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByEmail(String email);

}