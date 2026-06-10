package com.imobsys.system.controller;

import com.imobsys.system.dto.CorretorRequestDTO;
import com.imobsys.system.dto.CorretorResponseDTO;
import com.imobsys.system.dto.CorretorUpdateDTO;
import com.imobsys.system.service.CorretorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/corretores")
public class CorretorController {

    private final CorretorService corretorService;

    public CorretorController(CorretorService corretorService) {
        this.corretorService = corretorService;
    }

    @PostMapping
    public ResponseEntity<CorretorResponseDTO> criar(@Valid @RequestBody CorretorRequestDTO dto) {
        return new ResponseEntity<>(corretorService.criar(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CorretorResponseDTO>> listarTodos() {
        return ResponseEntity.ok(corretorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CorretorResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(corretorService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CorretorResponseDTO> atualizar(@PathVariable UUID id,
                                                         @Valid @RequestBody CorretorUpdateDTO dto) {
        return ResponseEntity.ok(corretorService.atualizarCompleto(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CorretorResponseDTO> atualizarParcial(@PathVariable UUID id,
                                                                @Valid @RequestBody CorretorUpdateDTO dto) {
        return ResponseEntity.ok(corretorService.atualizarParcial(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        corretorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
