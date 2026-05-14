package com.imobsys.system.dto;

import java.time.LocalDate;
import java.util.UUID;

public record PropostaResponseDTO(
        UUID id,
        String tipo,
        String status,
        Double valor,
        String formaPagamento,
        LocalDate validade,
        String termos,
        String nomeCliente,
        String telefoneCliente,
        String descricaoImovel,
        String nomeCorretor
) {}