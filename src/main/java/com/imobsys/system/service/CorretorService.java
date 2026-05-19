package com.imobsys.system.service;

import com.imobsys.system.dto.CorretorRequestDTO;
import com.imobsys.system.dto.CorretorResponseDTO;
import com.imobsys.system.dto.CorretorUpdateDTO;
import com.imobsys.system.exception.ConflictException;
import com.imobsys.system.exception.ResourceNotFoundException;
import com.imobsys.system.model.Corretor;
import com.imobsys.system.repository.CorretorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CorretorService {

    private final CorretorRepository corretorRepository;
    private final PasswordEncoder passwordEncoder;

    public CorretorService(CorretorRepository corretorRepository, PasswordEncoder passwordEncoder) {
        this.corretorRepository = corretorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CorretorResponseDTO criar(CorretorRequestDTO dto) {
        if (corretorRepository.existsByCpf(dto.cpf())) {
            throw new ConflictException("Já existe um corretor cadastrado com o CPF informado.");
        }
        if (corretorRepository.existsByEmail(dto.email())) {
            throw new ConflictException("Já existe um corretor cadastrado com o e-mail informado.");
        }

        Corretor corretor = new Corretor();
        corretor.setNome(dto.nome());
        corretor.setRg(dto.rg());
        corretor.setCpf(dto.cpf());
        corretor.setEmail(dto.email());
        corretor.setTelefone(dto.telefone());
        corretor.setSenha(passwordEncoder.encode(dto.senha()));
        return toResponse(corretorRepository.save(corretor));
    }

    @Transactional(readOnly = true)
    public List<CorretorResponseDTO> listarTodos() {
        return corretorRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CorretorResponseDTO buscarPorId(UUID id) {
        return toResponse(carregar(id));
    }

    @Transactional
    public CorretorResponseDTO atualizarCompleto(UUID id, CorretorUpdateDTO dto) {
        Corretor corretor = carregar(id);

        if (dto.email() != null && !dto.email().equals(corretor.getEmail())
                && corretorRepository.existsByEmail(dto.email())) {
            throw new ConflictException("E-mail já cadastrado para outro corretor.");
        }

        if (dto.nome() != null)     corretor.setNome(dto.nome());
        if (dto.rg() != null)       corretor.setRg(dto.rg());
        if (dto.email() != null)    corretor.setEmail(dto.email());
        if (dto.telefone() != null) corretor.setTelefone(dto.telefone());
        return toResponse(corretorRepository.save(corretor));
    }

    @Transactional
    public CorretorResponseDTO atualizarParcial(UUID id, CorretorUpdateDTO dto) {
        return atualizarCompleto(id, dto);
    }

    @Transactional
    public void deletar(UUID id) {
        if (!corretorRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Corretor", id);
        }
        corretorRepository.deleteById(id);
    }

    private Corretor carregar(UUID id) {
        return corretorRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Corretor", id));
    }

    private CorretorResponseDTO toResponse(Corretor c) {
        return new CorretorResponseDTO(
                c.getId(), c.getNome(), c.getRg(), c.getCpf(),
                c.getEmail(), c.getTelefone()
        );
    }
}
