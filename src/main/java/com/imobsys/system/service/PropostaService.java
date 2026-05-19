package com.imobsys.system.service;

import com.imobsys.system.dto.PropostaPublicaDTO;
import com.imobsys.system.dto.PropostaRequestDTO;
import com.imobsys.system.dto.PropostaResponseDTO;
import com.imobsys.system.dto.PropostaUpdateDTO;
import com.imobsys.system.dto.SolicitacaoAjusteDTO;
import com.imobsys.system.enums.StatusImovel;
import com.imobsys.system.enums.StatusProposta;
import com.imobsys.system.enums.TipoProposta;
import com.imobsys.system.exception.BusinessRuleException;
import com.imobsys.system.exception.ResourceNotFoundException;
import com.imobsys.system.model.Cliente;
import com.imobsys.system.model.Corretor;
import com.imobsys.system.model.Imovel;
import com.imobsys.system.model.Proposta;
import com.imobsys.system.repository.ClienteRepository;
import com.imobsys.system.repository.CorretorRepository;
import com.imobsys.system.repository.ImovelRepository;
import com.imobsys.system.repository.PropostaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PropostaService {

    private final PropostaRepository propostaRepository;
    private final ImovelRepository imovelRepository;
    private final ClienteRepository clienteRepository;
    private final CorretorRepository corretorRepository;

    public PropostaService(PropostaRepository propostaRepository,
                           ImovelRepository imovelRepository,
                           ClienteRepository clienteRepository,
                           CorretorRepository corretorRepository) {
        this.propostaRepository = propostaRepository;
        this.imovelRepository = imovelRepository;
        this.clienteRepository = clienteRepository;
        this.corretorRepository = corretorRepository;
    }

    // ----- CRUD privado (corretor autenticado) -----

    @Transactional
    public PropostaResponseDTO criar(PropostaRequestDTO dto) {
        Imovel imovel = imovelRepository.findById(dto.imovelId())
                .orElseThrow(() -> ResourceNotFoundException.of("Imóvel", dto.imovelId()));
        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> ResourceNotFoundException.of("Cliente", dto.clienteId()));
        Corretor corretor = corretorRepository.findById(dto.corretorId())
                .orElseThrow(() -> ResourceNotFoundException.of("Corretor", dto.corretorId()));

        if (imovel.getStatus() == StatusImovel.VENDIDO || imovel.getStatus() == StatusImovel.ALUGADO) {
            throw new BusinessRuleException(
                    "Não é possível criar proposta para um imóvel já " + imovel.getStatus() + "."
            );
        }

        Proposta proposta = new Proposta();
        proposta.setImovel(imovel);
        proposta.setCliente(cliente);
        proposta.setCorretor(corretor);
        proposta.setTipo(dto.tipo());
        proposta.setValor(dto.valor());
        proposta.setFormaPagamento(dto.formaPagamento());
        proposta.setTermos(dto.termos());
        proposta.setStatus(StatusProposta.RASCUNHO);
        proposta.setValidade(dto.validade() != null ? dto.validade() : LocalDate.now().plusDays(7));

        return toResponse(propostaRepository.save(proposta));
    }

    @Transactional(readOnly = true)
    public List<PropostaResponseDTO> listarTodas() {
        return propostaRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public PropostaResponseDTO buscarPorId(UUID id) {
        return toResponse(carregar(id));
    }

    @Transactional
    public PropostaResponseDTO atualizarCompleto(UUID id, PropostaUpdateDTO dto) {
        Proposta proposta = carregar(id);
        if (!proposta.getStatus().ehEditavel()) {
            throw new BusinessRuleException(
                    "Proposta no status " + proposta.getStatus() + " não pode ser editada."
            );
        }

        if (dto.tipo() != null)            proposta.setTipo(dto.tipo());
        if (dto.valor() != null)           proposta.setValor(dto.valor());
        if (dto.formaPagamento() != null)  proposta.setFormaPagamento(dto.formaPagamento());
        if (dto.validade() != null)        proposta.setValidade(dto.validade());
        if (dto.termos() != null)          proposta.setTermos(dto.termos());

        return toResponse(propostaRepository.save(proposta));
    }

    @Transactional
    public PropostaResponseDTO atualizarParcial(UUID id, PropostaUpdateDTO dto) {
        return atualizarCompleto(id, dto);
    }

    @Transactional
    public void deletar(UUID id) {
        Proposta proposta = carregar(id);
        if (proposta.getStatus() != StatusProposta.RASCUNHO
                && proposta.getStatus() != StatusProposta.CANCELADA
                && proposta.getStatus() != StatusProposta.RECUSADA) {
            throw new BusinessRuleException(
                    "Apenas propostas em RASCUNHO, CANCELADA ou RECUSADA podem ser excluídas."
            );
        }
        propostaRepository.delete(proposta);
    }

    // ----- Transições de estado disparadas pelo corretor -----

    @Transactional
    public PropostaResponseDTO enviar(UUID id) {
        Proposta proposta = carregar(id);
        transicionar(proposta, StatusProposta.PENDENTE_ACEITACAO);
        proposta.setObservacaoAjuste(null);
        return toResponse(propostaRepository.save(proposta));
    }

    @Transactional
    public PropostaResponseDTO cancelar(UUID id) {
        Proposta proposta = carregar(id);
        transicionar(proposta, StatusProposta.CANCELADA);
        liberarImovelSeReservado(proposta);
        return toResponse(propostaRepository.save(proposta));
    }

    @Transactional
    public PropostaResponseDTO atualizarStatus(UUID id, StatusProposta novoStatus) {
        Proposta proposta = carregar(id);
        transicionar(proposta, novoStatus);

        if (novoStatus == StatusProposta.ACEITA) {
            efetivarAceitacao(proposta);
        } else if (novoStatus == StatusProposta.CANCELADA || novoStatus == StatusProposta.RECUSADA) {
            liberarImovelSeReservado(proposta);
        }
        return toResponse(propostaRepository.save(proposta));
    }

    // ----- Endpoints públicos (cliente via link) -----

    @Transactional(readOnly = true)
    public PropostaPublicaDTO buscarPublica(UUID id) {
        Proposta proposta = carregar(id);
        if (proposta.getStatus() == StatusProposta.RASCUNHO) {
            throw new BusinessRuleException("Esta proposta ainda não foi enviada pelo corretor.");
        }
        return toPublicaResponse(proposta);
    }

    @Transactional
    public PropostaPublicaDTO aceitarPublica(UUID id) {
        Proposta proposta = carregar(id);
        transicionar(proposta, StatusProposta.ACEITA);
        efetivarAceitacao(proposta);
        return toPublicaResponse(propostaRepository.save(proposta));
    }

    @Transactional
    public PropostaPublicaDTO recusarPublica(UUID id) {
        Proposta proposta = carregar(id);
        transicionar(proposta, StatusProposta.RECUSADA);
        return toPublicaResponse(propostaRepository.save(proposta));
    }

    @Transactional
    public PropostaPublicaDTO solicitarAjustePublico(UUID id, SolicitacaoAjusteDTO dto) {
        Proposta proposta = carregar(id);
        transicionar(proposta, StatusProposta.AJUSTE_SOLICITADO);
        proposta.setObservacaoAjuste(dto.observacao());
        return toPublicaResponse(propostaRepository.save(proposta));
    }

    // ----- Helpers de regras de negócio -----

    private void transicionar(Proposta proposta, StatusProposta destino) {
        StatusProposta atual = proposta.getStatus();
        if (atual == destino) {
            throw new BusinessRuleException("A proposta já está no status " + destino + ".");
        }
        if (proposta.getValidade() != null && proposta.getValidade().isBefore(LocalDate.now())
                && destino != StatusProposta.EXPIRADA && destino != StatusProposta.CANCELADA) {
            proposta.setStatus(StatusProposta.EXPIRADA);
            throw new BusinessRuleException(
                    "A proposta expirou em " + proposta.getValidade() + " e não pode mais ser alterada."
            );
        }
        if (!atual.podeTransitarPara(destino)) {
            throw new BusinessRuleException(
                    "Transição inválida: " + atual + " → " + destino + "."
            );
        }
        proposta.setStatus(destino);
    }

    private void efetivarAceitacao(Proposta proposta) {
        Imovel imovel = proposta.getImovel();
        if (proposta.getTipo() == TipoProposta.VENDA) {
            imovel.setStatus(StatusImovel.EM_NEGOCIACAO);
        } else if (proposta.getTipo() == TipoProposta.ALUGUEL) {
            imovel.setStatus(StatusImovel.EM_NEGOCIACAO);
        }
        imovelRepository.save(imovel);
    }

    private void liberarImovelSeReservado(Proposta proposta) {
        Imovel imovel = proposta.getImovel();
        if (imovel.getStatus() == StatusImovel.EM_NEGOCIACAO || imovel.getStatus() == StatusImovel.RESERVADO) {
            imovel.setStatus(StatusImovel.DISPONIVEL);
            imovelRepository.save(imovel);
        }
    }

    private Proposta carregar(UUID id) {
        return propostaRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Proposta", id));
    }

    // ----- Mapeamentos -----

    private PropostaResponseDTO toResponse(Proposta p) {
        return new PropostaResponseDTO(
                p.getId(),
                p.getTipo(),
                p.getStatus(),
                p.getValor(),
                p.getFormaPagamento(),
                p.getValidade(),
                p.getTermos(),
                p.getObservacaoAjuste(),
                p.getDataCriacao(),
                p.getDataAtualizacao(),
                p.getCliente().getNome(),
                p.getCliente().getTelefone(),
                p.getImovel().getTipo() + " em " + p.getImovel().getCidade(),
                p.getCorretor().getNome()
        );
    }

    private PropostaPublicaDTO toPublicaResponse(Proposta p) {
        Imovel i = p.getImovel();
        Corretor c = p.getCorretor();
        return new PropostaPublicaDTO(
                p.getId(),
                p.getTipo(),
                p.getStatus(),
                p.getValor(),
                p.getFormaPagamento(),
                p.getValidade(),
                p.getTermos(),
                p.getObservacaoAjuste(),
                c.getNome(),
                c.getTelefone(),
                c.getEmail(),
                i.getTipo() + " em " + i.getCidade(),
                i.getEndereco(),
                i.getCidade(),
                i.getMetragem(),
                i.getQtdComodos(),
                i.getQtdBanheiros()
        );
    }
}
