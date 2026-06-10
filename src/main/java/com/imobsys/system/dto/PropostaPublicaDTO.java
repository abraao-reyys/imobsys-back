package com.imobsys.system.dto;

import com.imobsys.system.enums.FormaPagamento;
import com.imobsys.system.enums.StatusProposta;
import com.imobsys.system.enums.TipoProposta;

import java.time.LocalDate;
import java.util.UUID;

public record PropostaPublicaDTO(
        UUID id,
        TipoProposta tipo,
        StatusProposta status,
        Double valor,
        FormaPagamento formaPagamento,
        LocalDate validade,
        String termos,
        String observacaoAjuste,
        String nomeCorretor,
        String telefoneCorretor,
        String emailCorretor,
        String descricaoImovel,
        String enderecoImovel,
        String cidadeImovel,
        Double metragemImovel,
        Integer qtdComodosImovel,
        Integer qtdBanheirosImovel
) {}
