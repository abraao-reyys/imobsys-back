package com.imobsys.system.controller;

import com.imobsys.system.dto.ImovelRequestDTO;
import com.imobsys.system.dto.ImovelResponseDTO;
import com.imobsys.system.dto.ImovelStatusUpdateDTO;
import com.imobsys.system.dto.ImovelUpdateDTO;
import com.imobsys.system.service.ImovelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/imoveis")
public class ImovelController {

    private final ImovelService imovelService;

    public ImovelController(ImovelService imovelService) {
        this.imovelService = imovelService;
    }

    @PostMapping
    public ResponseEntity<ImovelResponseDTO> criar(@Valid @RequestBody ImovelRequestDTO dto) {
        return new ResponseEntity<>(imovelService.criar(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ImovelResponseDTO>> listarTodos() {
        return ResponseEntity.ok(imovelService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImovelResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(imovelService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImovelResponseDTO> atualizar(@PathVariable UUID id,
                                                       @Valid @RequestBody ImovelRequestDTO dto) {
        return ResponseEntity.ok(imovelService.atualizarCompleto(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ImovelResponseDTO> atualizarParcial(@PathVariable UUID id,
                                                              @Valid @RequestBody ImovelUpdateDTO dto) {
        return ResponseEntity.ok(imovelService.atualizarParcial(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ImovelResponseDTO> atualizarStatus(@PathVariable UUID id,
                                                             @Valid @RequestBody ImovelStatusUpdateDTO dto) {
        return ResponseEntity.ok(imovelService.atualizarStatus(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        imovelService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
