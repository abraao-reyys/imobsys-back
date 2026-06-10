package com.imobsys.system.controller;

import com.imobsys.system.dto.PropostaRequestDTO;
import com.imobsys.system.dto.PropostaResponseDTO;
import com.imobsys.system.dto.PropostaUpdateDTO;
import com.imobsys.system.enums.StatusProposta;
import com.imobsys.system.service.PropostaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/propostas")
public class PropostaController {

    private final PropostaService propostaService;

    public PropostaController(PropostaService propostaService) {
        this.propostaService = propostaService;
    }

    @PostMapping
    public ResponseEntity<PropostaResponseDTO> criar(@Valid @RequestBody PropostaRequestDTO dto) {
        return new ResponseEntity<>(propostaService.criar(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PropostaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(propostaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropostaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(propostaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropostaResponseDTO> atualizar(@PathVariable UUID id,
                                                         @Valid @RequestBody PropostaUpdateDTO dto) {
        return ResponseEntity.ok(propostaService.atualizarCompleto(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PropostaResponseDTO> atualizarParcial(@PathVariable UUID id,
                                                                @Valid @RequestBody PropostaUpdateDTO dto) {
        return ResponseEntity.ok(propostaService.atualizarParcial(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PropostaResponseDTO> atualizarStatus(@PathVariable UUID id,
                                                               @RequestParam StatusProposta novoStatus) {
        return ResponseEntity.ok(propostaService.atualizarStatus(id, novoStatus));
    }

    @PostMapping("/{id}/enviar")
    public ResponseEntity<PropostaResponseDTO> enviar(@PathVariable UUID id) {
        return ResponseEntity.ok(propostaService.enviar(id));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<PropostaResponseDTO> cancelar(@PathVariable UUID id) {
        return ResponseEntity.ok(propostaService.cancelar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        propostaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
