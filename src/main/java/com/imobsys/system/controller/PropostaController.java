package com.imobsys.system.controller;

import com.imobsys.system.dto.PropostaRequestDTO;
import com.imobsys.system.dto.PropostaResponseDTO;
import com.imobsys.system.service.PropostaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/propostas")
@CrossOrigin(origins = "*")
public class PropostaController {

    private final PropostaService propostaService;

    public PropostaController(PropostaService propostaService) {
        this.propostaService = propostaService;
    }

    @PostMapping
    public ResponseEntity<PropostaResponseDTO> criar(@RequestBody PropostaRequestDTO dto) {
        PropostaResponseDTO novaProposta = propostaService.criarProposta(dto);
        return new ResponseEntity<>(novaProposta, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PropostaResponseDTO>> listarTodas() {
        List<PropostaResponseDTO> propostas = propostaService.listarTodas();
        return ResponseEntity.ok(propostas);
    }
}