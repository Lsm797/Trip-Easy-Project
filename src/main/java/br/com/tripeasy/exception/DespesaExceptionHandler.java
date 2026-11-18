package br.com.tripeasy.exception;

import br.com.tripeasy.controller.DespesaController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Complementa o GlobalExceptionHandler só para o DespesaController:
 * data ou categoria em formato inválido (texto puro, como no restante do sistema).
 */
@RestControllerAdvice(assignableTypes = DespesaController.class)
public class DespesaExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> corpoInvalido(HttpMessageNotReadableException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Corpo da requisição inválido. Use data no formato AAAA-MM-DD e categoria "
                        + "ALIMENTACAO, TRANSPORTE, HOSPEDAGEM, PASSEIOS ou OUTROS.");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> parametroInvalido(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Valor inválido para o parâmetro '" + ex.getName() + "'.");
    }
}
