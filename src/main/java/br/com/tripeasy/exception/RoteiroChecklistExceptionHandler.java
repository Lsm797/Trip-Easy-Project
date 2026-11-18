package br.com.tripeasy.exception;

import br.com.tripeasy.controller.AtividadeController;
import br.com.tripeasy.controller.ChecklistController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Complementa o GlobalExceptionHandler (Pessoa 1) só para os controllers de roteiro e checklist.
 * Validação (400) e "não encontrado" (404) já são tratados pelo handler global;
 * aqui entram apenas data/horário em formato inválido, também em texto puro.
 */
@RestControllerAdvice(assignableTypes = {AtividadeController.class, ChecklistController.class})
public class RoteiroChecklistExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> corpoInvalido(HttpMessageNotReadableException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Corpo da requisição inválido. Use datas no formato AAAA-MM-DD e horários no formato HH:mm.");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> parametroInvalido(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Valor inválido para o parâmetro '" + ex.getName() + "'.");
    }
}
