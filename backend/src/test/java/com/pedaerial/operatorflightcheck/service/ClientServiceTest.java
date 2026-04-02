package com.pedaerial.operatorflightcheck.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pedaerial.operatorflightcheck.dto.ClientRequest;
import com.pedaerial.operatorflightcheck.dto.ClientResponse;
import com.pedaerial.operatorflightcheck.entity.Client;
import com.pedaerial.operatorflightcheck.exception.ResourceNotFoundException;
import com.pedaerial.operatorflightcheck.repository.ClientRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    @Test
    void testCreateClient_success() {
        ClientRequest request = ClientRequest.builder().name("Summit").email("hi@example.com").build();
        Client saved = Client.builder().id("client-1").userId("user-1").name("Summit").email("hi@example.com").build();
        when(clientRepository.save(org.mockito.ArgumentMatchers.any(Client.class))).thenReturn(saved);

        ClientResponse response = clientService.createClient("user-1", request);

        assertThat(response.getId()).isEqualTo("client-1");
        assertThat(response.getName()).isEqualTo("Summit");
    }

    @Test
    void testGetClients_returnsOnlyOwnedClients() {
        when(clientRepository.findByUserIdOrderByNameAsc("user-1")).thenReturn(List.of(
            Client.builder().id("client-1").userId("user-1").name("A").build()
        ));

        List<ClientResponse> response = clientService.getClients("user-1");

        assertThat(response).hasSize(1);
        assertThat(response.get(0).getId()).isEqualTo("client-1");
    }

    @Test
    void testGetClientById_notFound_throwsException() {
        when(clientRepository.findByIdAndUserId("missing", "user-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.getClientById("user-1", "missing"))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Client not found");
    }

    @Test
    void testUpdateClient_success() {
        Client client = Client.builder().id("client-1").userId("user-1").name("Old").build();
        ClientRequest request = ClientRequest.builder().name("New Name").company("New Co").build();
        when(clientRepository.findByIdAndUserId("client-1", "user-1")).thenReturn(Optional.of(client));
        when(clientRepository.save(client)).thenReturn(client);

        ClientResponse response = clientService.updateClient("user-1", "client-1", request);

        assertThat(response.getName()).isEqualTo("New Name");
        assertThat(client.getCompany()).isEqualTo("New Co");
    }

    @Test
    void testDeleteClient_success() {
        Client client = Client.builder().id("client-1").userId("user-1").name("Delete Me").build();
        when(clientRepository.findByIdAndUserId("client-1", "user-1")).thenReturn(Optional.of(client));

        clientService.deleteClient("user-1", "client-1");

        verify(clientRepository).delete(client);
    }
}
