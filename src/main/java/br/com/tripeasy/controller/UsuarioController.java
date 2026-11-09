
package br.com.tripeasy.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;

import br.com.tripeasy.dto.UsuarioCadastroDTO;
import br.com.tripeasy.dto.UsuarioLoginDTO;
import br.com.tripeasy.model.Usuario;
import br.com.tripeasy.service.UsuarioService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public UsuarioController(
            UsuarioService usuarioService,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository) {

        this.usuarioService = usuarioService;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<String> cadastrar(
            @RequestBody UsuarioCadastroDTO dados) {

        Usuario usuario = new Usuario();

        usuario.setNome(dados.getNome());
        usuario.setEmail(dados.getEmail());
        usuario.setSenha(dados.getSenha());

        usuarioService.cadastrar(usuario);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Usuário cadastrado com sucesso!");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestBody UsuarioLoginDTO dados,
            HttpServletRequest request,
            HttpServletResponse response) {

        Authentication autenticacao = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        dados.getEmail(),
                        dados.getSenha()
                )
        );

        SecurityContext contexto =
                SecurityContextHolder.createEmptyContext();

        contexto.setAuthentication(autenticacao);

        SecurityContextHolder.setContext(contexto);

        securityContextRepository.saveContext(
                contexto, request, response
        );

        return ResponseEntity.ok("Login realizado com sucesso!");
    }

    
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        SecurityContextLogoutHandler logoutHandler =
                new SecurityContextLogoutHandler();

        logoutHandler.logout(
                request,
                response,
                SecurityContextHolder.getContext().getAuthentication()
        );

        return ResponseEntity.ok("Logout realizado com sucesso!");
}

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> tratarErro(
            IllegalArgumentException erro) {

        return ResponseEntity
                .badRequest()
                .body(erro.getMessage());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> tratarErroLogin(
            AuthenticationException erro) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("E-mail ou senha inválidos!");
    }
}
