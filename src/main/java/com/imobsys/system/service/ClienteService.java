package com.imobsys.system.service;

import com.imobsys.system.dto.ClienteRequestDTO;
import com.imobsys.system.dto.ClienteResponseDTO;
import com.imobsys.system.dto.ClienteUpdateDTO;
import com.imobsys.system.exception.ConflictException;
import com.imobsys.system.exception.ResourceNotFoundException;
import com.imobsys.system.model.Cliente;
import com.imobsys.system.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public ClienteResponseDTO criar(ClienteRequestDTO dto) {
        if (clienteRepository.existsByCpf(dto.cpf())) {
            throw new ConflictException("Já existe um cliente cadastrado com o CPF informado.");
        }
        if (dto.email() != null && !dto.email().isBlank() && clienteRepository.existsByEmail(dto.email())) {
            throw new ConflictException("Já existe um cliente cadastrado com o e-mail informado.");
        }

        Cliente cliente = new Cliente();
        cliente.setNome(dto.nome());
        cliente.setRg(dto.rg());
        cliente.setCpf(dto.cpf());
        cliente.setEmail(dto.email());
        cliente.setTelefone(dto.telefone());
        cliente.setRenda(dto.renda());
        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponseDTO buscarPorId(UUID id) {
        return toResponse(carregar(id));
    }

    @Transactional
    public ClienteResponseDTO atualizarCompleto(UUID id, ClienteRequestDTO dto) {
        Cliente cliente = carregar(id);

        if (!cliente.getCpf().equals(dto.cpf()) && clienteRepository.existsByCpf(dto.cpf())) {
            throw new ConflictException("CPF já cadastrado para outro cliente.");
        }
        if (dto.email() != null && !dto.email().equals(cliente.getEmail())
                && clienteRepository.existsByEmail(dto.email())) {
            throw new ConflictException("E-mail já cadastrado para outro cliente.");
        }

        cliente.setNome(dto.nome());
        cliente.setRg(dto.rg());
        cliente.setCpf(dto.cpf());
        cliente.setEmail(dto.email());
        cliente.setTelefone(dto.telefone());
        cliente.setRenda(dto.renda());
        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponseDTO atualizarParcial(UUID id, ClienteUpdateDTO dto) {
        Cliente cliente = carregar(id);

        if (dto.email() != null && !dto.email().equals(cliente.getEmail())
                && clienteRepository.existsByEmail(dto.email())) {
            throw new ConflictException("E-mail já cadastrado para outro cliente.");
        }

        if (dto.nome() != null)     cliente.setNome(dto.nome());
        if (dto.rg() != null)       cliente.setRg(dto.rg());
        if (dto.email() != null)    cliente.setEmail(dto.email());
        if (dto.telefone() != null) cliente.setTelefone(dto.telefone());
        if (dto.renda() != null)    cliente.setRenda(dto.renda());
        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public void deletar(UUID id) {
        if (!clienteRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Cliente", id);
        }
        clienteRepository.deleteById(id);
    }

    private Cliente carregar(UUID id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Cliente", id));
    }

    private ClienteResponseDTO toResponse(Cliente c) {
        return new ClienteResponseDTO(
                c.getId(), c.getNome(), c.getRg(), c.getCpf(),
                c.getEmail(), c.getTelefone(), c.getRenda(), c.getDataCadastro()
        );
    }
}
