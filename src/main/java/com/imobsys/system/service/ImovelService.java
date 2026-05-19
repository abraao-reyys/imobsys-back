package com.imobsys.system.service;

import com.imobsys.system.dto.ImovelRequestDTO;
import com.imobsys.system.dto.ImovelResponseDTO;
import com.imobsys.system.dto.ImovelStatusUpdateDTO;
import com.imobsys.system.dto.ImovelUpdateDTO;
import com.imobsys.system.enums.StatusImovel;
import com.imobsys.system.exception.ConflictException;
import com.imobsys.system.exception.ResourceNotFoundException;
import com.imobsys.system.model.Imovel;
import com.imobsys.system.repository.ImovelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ImovelService {

    private final ImovelRepository imovelRepository;

    public ImovelService(ImovelRepository imovelRepository) {
        this.imovelRepository = imovelRepository;
    }

    @Transactional
    public ImovelResponseDTO criar(ImovelRequestDTO dto) {
        if (dto.matricula() != null && imovelRepository.existsByMatricula(dto.matricula())) {
            throw new ConflictException("Já existe um imóvel cadastrado com essa matrícula.");
        }

        Imovel imovel = new Imovel();
        copy(dto, imovel);
        imovel.setStatus(dto.status() != null ? dto.status() : StatusImovel.DISPONIVEL);
        return toResponse(imovelRepository.save(imovel));
    }

    @Transactional(readOnly = true)
    public List<ImovelResponseDTO> listarTodos() {
        return imovelRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ImovelResponseDTO buscarPorId(UUID id) {
        return toResponse(carregar(id));
    }

    @Transactional
    public ImovelResponseDTO atualizarCompleto(UUID id, ImovelRequestDTO dto) {
        Imovel imovel = carregar(id);

        if (dto.matricula() != null && !dto.matricula().equals(imovel.getMatricula())
                && imovelRepository.existsByMatricula(dto.matricula())) {
            throw new ConflictException("Matrícula já cadastrada para outro imóvel.");
        }

        copy(dto, imovel);
        if (dto.status() != null) {
            imovel.setStatus(dto.status());
        }
        return toResponse(imovelRepository.save(imovel));
    }

    @Transactional
    public ImovelResponseDTO atualizarParcial(UUID id, ImovelUpdateDTO dto) {
        Imovel imovel = carregar(id);

        if (dto.tipo() != null)              imovel.setTipo(dto.tipo());
        if (dto.metragem() != null)          imovel.setMetragem(dto.metragem());
        if (dto.valorMinimo() != null)       imovel.setValorMinimo(dto.valorMinimo());
        if (dto.valorMaximo() != null)       imovel.setValorMaximo(dto.valorMaximo());
        if (dto.valorIptu() != null)         imovel.setValorIptu(dto.valorIptu());
        if (dto.cidade() != null)            imovel.setCidade(dto.cidade());
        if (dto.estado() != null)            imovel.setEstado(dto.estado());
        if (dto.cep() != null)               imovel.setCep(dto.cep());
        if (dto.endereco() != null)          imovel.setEndereco(dto.endereco());
        if (dto.qtdComodos() != null)        imovel.setQtdComodos(dto.qtdComodos());
        if (dto.qtdBanheiros() != null)      imovel.setQtdBanheiros(dto.qtdBanheiros());
        if (dto.particularidades() != null)  imovel.setParticularidades(dto.particularidades());
        if (dto.vistoriaRealizada() != null) imovel.setVistoriaRealizada(dto.vistoriaRealizada());

        return toResponse(imovelRepository.save(imovel));
    }

    @Transactional
    public ImovelResponseDTO atualizarStatus(UUID id, ImovelStatusUpdateDTO dto) {
        Imovel imovel = carregar(id);
        imovel.setStatus(dto.status());
        return toResponse(imovelRepository.save(imovel));
    }

    @Transactional
    public void deletar(UUID id) {
        Imovel imovel = carregar(id);
        if (imovel.getStatus() == StatusImovel.EM_NEGOCIACAO
                || imovel.getStatus() == StatusImovel.VENDIDO
                || imovel.getStatus() == StatusImovel.ALUGADO) {
            throw new ConflictException(
                    "Não é possível excluir um imóvel com status " + imovel.getStatus()
                            + ". Cancele as propostas vinculadas ou altere o status antes."
            );
        }
        imovelRepository.delete(imovel);
    }

    private Imovel carregar(UUID id) {
        return imovelRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Imóvel", id));
    }

    private void copy(ImovelRequestDTO dto, Imovel imovel) {
        imovel.setTipo(dto.tipo());
        imovel.setMatricula(dto.matricula());
        imovel.setMetragem(dto.metragem());
        imovel.setValorMinimo(dto.valorMinimo());
        imovel.setValorMaximo(dto.valorMaximo());
        imovel.setValorIptu(dto.valorIptu());
        imovel.setCidade(dto.cidade());
        imovel.setEstado(dto.estado());
        imovel.setCep(dto.cep());
        imovel.setEndereco(dto.endereco());
        imovel.setQtdComodos(dto.qtdComodos());
        imovel.setQtdBanheiros(dto.qtdBanheiros());
        imovel.setParticularidades(dto.particularidades());
        imovel.setVistoriaRealizada(dto.vistoriaRealizada());
    }

    private ImovelResponseDTO toResponse(Imovel i) {
        return new ImovelResponseDTO(
                i.getId(), i.getTipo(), i.getStatus(), i.getMatricula(), i.getMetragem(),
                i.getValorMinimo(), i.getValorMaximo(), i.getValorIptu(),
                i.getCidade(), i.getEstado(), i.getCep(), i.getEndereco(),
                i.getQtdComodos(), i.getQtdBanheiros(), i.getParticularidades(),
                i.getVistoriaRealizada()
        );
    }
}
