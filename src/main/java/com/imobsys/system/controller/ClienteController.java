package com.imobsys.system.controller;

import com.imobsys.system.dto.ClienteRequestDTO;
import com.imobsys.system.dto.ClienteResponseDTO;
import com.imobsys.system.dto.ClienteUpdateDTO;
import com.imobsys.system.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDTO> criar(@Valid @RequestBody ClienteRequestDTO dto) {
        return new ResponseEntity<>(clienteService.criar(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> atualizar(@PathVariable UUID id,
                                                        @Valid @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.ok(clienteService.atualizarCompleto(id, dto));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ClienteResponseDTO> atualizarParcial(@PathVariable UUID id,
                                                               @Valid @RequestBody ClienteUpdateDTO dto) {
        return ResponseEntity.ok(clienteService.atualizarParcial(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        clienteService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
