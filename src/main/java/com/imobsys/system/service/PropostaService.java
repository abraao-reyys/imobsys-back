package com.imobsys.system.service;

import com.imobsys.system.dto.PropostaRequestDTO;
import com.imobsys.system.dto.PropostaResponseDTO;
import com.imobsys.system.model.Cliente;
import com.imobsys.system.model.Corretor;
import com.imobsys.system.model.Imovel;
import com.imobsys.system.model.Proposta;
import com.imobsys.system.repository.ClienteRepository;
import com.imobsys.system.repository.CorretorRepository;
import com.imobsys.system.repository.ImovelRepository;
import com.imobsys.system.repository.PropostaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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

    public PropostaResponseDTO criarProposta(PropostaRequestDTO dto) {
        Imovel imovel = imovelRepository.findById(dto.imovelId())
                .orElseThrow(() -> new RuntimeException("Imóvel não encontrado."));
        Cliente cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado."));
        Corretor corretor = corretorRepository.findById(dto.corretorId())
                .orElseThrow(() -> new RuntimeException("Corretor não encontrado."));

        Proposta proposta = new Proposta();
        proposta.setImovel(imovel);
        proposta.setCliente(cliente);
        proposta.setCorretor(corretor);
        proposta.setTipo(dto.tipo());
        proposta.setValor(dto.valor());
        proposta.setFormaPagamento(dto.formaPagamento());
        proposta.setTermos(dto.termos());

        proposta.setStatus("PENDENTE");
        proposta.setValidade(dto.validade() != null ? dto.validade() : LocalDate.now().plusDays(7));

        if (proposta.getValor() != null && proposta.getValor() < 0) {
            throw new IllegalArgumentException("O valor da proposta não pode ser negativo.");
        }

        Proposta propostaSalva = propostaRepository.save(proposta);

        return mapToResponseDTO(propostaSalva);
    }

    public List<PropostaResponseDTO> listarTodas() {
        return propostaRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private PropostaResponseDTO mapToResponseDTO(Proposta proposta) {
        return new PropostaResponseDTO(
                proposta.getId(),
                proposta.getTipo(),
                proposta.getStatus(),
                proposta.getValor(),
                proposta.getFormaPagamento(),
                proposta.getValidade(),
                proposta.getTermos(),
                proposta.getCliente().getNome(),
                proposta.getCliente().getTelefone(),
                proposta.getImovel().getTipo() + " em " + proposta.getImovel().getCidade(),
                proposta.getCorretor().getNome()
        );
    }
}