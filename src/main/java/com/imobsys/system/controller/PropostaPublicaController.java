package com.imobsys.system.controller;

import com.imobsys.system.dto.PropostaPublicaDTO;
import com.imobsys.system.dto.SolicitacaoAjusteDTO;
import com.imobsys.system.service.PropostaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/propostas/publico")
public class PropostaPublicaController {

    private final PropostaService propostaService;

    public PropostaPublicaController(PropostaService propostaService) {
        this.propostaService = propostaService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropostaPublicaDTO> visualizar(@PathVariable UUID id) {
        return ResponseEntity.ok(propostaService.buscarPublica(id));
    }

    @PostMapping("/{id}/aceitar")
    public ResponseEntity<PropostaPublicaDTO> aceitar(@PathVariable UUID id) {
        return ResponseEntity.ok(propostaService.aceitarPublica(id));
    }

    @PostMapping("/{id}/recusar")
    public ResponseEntity<PropostaPublicaDTO> recusar(@PathVariable UUID id) {
        return ResponseEntity.ok(propostaService.recusarPublica(id));
    }

    @PostMapping("/{id}/solicitar-ajuste")
    public ResponseEntity<PropostaPublicaDTO> solicitarAjuste(@PathVariable UUID id,
                                                              @Valid @RequestBody SolicitacaoAjusteDTO dto) {
        return ResponseEntity.ok(propostaService.solicitarAjustePublico(id, dto));
    }
}
