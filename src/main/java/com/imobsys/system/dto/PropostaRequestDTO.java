package com.imobsys.system.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PropostaRequestDTO(
        UUID imovelId,
        UUID clienteId,
        UUID corretorId,
        String tipo,
        Double valor,
        String formaPagamento,
        LocalDate validade,
        String termos
) {}