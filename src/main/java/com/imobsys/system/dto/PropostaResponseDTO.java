package com.imobsys.system.dto;

import com.imobsys.system.enums.FormaPagamento;
import com.imobsys.system.enums.StatusProposta;
import com.imobsys.system.enums.TipoProposta;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PropostaResponseDTO(
        UUID id,
        TipoProposta tipo,
        StatusProposta status,
        Double valor,
        FormaPagamento formaPagamento,
        LocalDate validade,
        String termos,
        String observacaoAjuste,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao,
        String nomeCliente,
        String telefoneCliente,
        String descricaoImovel,
        String nomeCorretor
) {}
