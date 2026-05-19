package com.imobsys.system.enums;

import java.util.Set;

public enum StatusProposta {
    RASCUNHO,
    PENDENTE_ACEITACAO,
    ACEITA,
    RECUSADA,
    AJUSTE_SOLICITADO,
    EXPIRADA,
    CANCELADA;

    public boolean podeTransitarPara(StatusProposta destino) {
        return TRANSICOES_VALIDAS.getOrDefault(this, Set.of()).contains(destino);
    }

    public boolean ehTerminal() {
        return this == ACEITA || this == RECUSADA || this == EXPIRADA || this == CANCELADA;
    }

    public boolean ehEditavel() {
        return this == RASCUNHO || this == AJUSTE_SOLICITADO;
    }

    private static final java.util.Map<StatusProposta, Set<StatusProposta>> TRANSICOES_VALIDAS = java.util.Map.of(
            RASCUNHO,           Set.of(PENDENTE_ACEITACAO, CANCELADA),
            PENDENTE_ACEITACAO, Set.of(ACEITA, RECUSADA, AJUSTE_SOLICITADO, EXPIRADA, CANCELADA),
            AJUSTE_SOLICITADO,  Set.of(PENDENTE_ACEITACAO, CANCELADA),
            ACEITA,             Set.of(),
            RECUSADA,           Set.of(),
            EXPIRADA,           Set.of(),
            CANCELADA,          Set.of()
    );
}
