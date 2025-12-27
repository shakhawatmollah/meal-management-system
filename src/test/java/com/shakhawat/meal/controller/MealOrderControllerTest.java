package com.shakhawat.meal.controller;

import com.shakhawat.meal.dto.MealOrderDTO;
import com.shakhawat.meal.entity.OrderStatus;
import com.shakhawat.meal.service.MealOrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.time.LocalDate;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MealOrderController.class)
@ActiveProfiles("test")
@WithMockUser(roles = "EMPLOYEE")
class MealOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private MealOrderService orderService;

    @Nested
    @DisplayName("Create Order Tests")
    class CreateOrderTests {

        @Test
        @DisplayName("Should create order successfully")
        void shouldCreateOrderSuccessfully() throws Exception {
            // Given
            MealOrderDTO.Request request = MealOrderDTO.Request.builder()
                    .employeeId(1L)
                    .mealId(1L)
                    .orderDate(LocalDate.now().plusDays(1))
                    .quantity(2)
                    .build();

            MealOrderDTO.Response response = MealOrderDTO.Response.builder()
                    .id(1L)
                    .employeeId(1L)
                    .employeeName("John Doe")
                    .mealId(1L)
                    .mealName("Chicken Biryani")
                    .orderDate(LocalDate.now().plusDays(1))
                    .quantity(2)
                    .totalPrice(new BigDecimal("25.00"))
                    .status(OrderStatus.PENDING)
                    .build();

            when(orderService.createOrder(any())).thenReturn(response);

            // When & Then
            mockMvc.perform(post("/api/v1/orders")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.quantity").value(2))
                    .andExpect(jsonPath("$.data.totalPrice").value(25.00));

            verify(orderService).createOrder(any(MealOrderDTO.Request.class));
        }

        @Test
        @DisplayName("Should return 400 when quantity is invalid")
        void shouldReturn400WhenQuantityIsInvalid() throws Exception {
            // Given
            MealOrderDTO.Request request = MealOrderDTO.Request.builder()
                    .employeeId(1L)
                    .mealId(1L)
                    .orderDate(LocalDate.now().plusDays(1))
                    .quantity(0) // Invalid quantity
                    .build();

            // When & Then
            mockMvc.perform(post("/api/v1/orders")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());

            verify(orderService, never()).createOrder(any());
        }
    }

    @Nested
    @DisplayName("Cancel Order Tests")
    class CancelOrderTests {

        @Test
        @DisplayName("Should cancel order successfully")
        void shouldCancelOrderSuccessfully() throws Exception {
            // Given
            doNothing().when(orderService).cancelOrder(1L);

            // When & Then
            mockMvc.perform(delete("/api/v1/orders/1")
                            .with(csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Order cancelled successfully"));

            verify(orderService).cancelOrder(1L);
        }
    }

    @Nested
    @DisplayName("Update Order Status Tests")
    @WithMockUser(roles = "ADMIN")
    class UpdateOrderStatusTests {

        @Test
        @DisplayName("Should update order status successfully")
        void shouldUpdateOrderStatusSuccessfully() throws Exception {
            // Given
            MealOrderDTO.Response response = MealOrderDTO.Response.builder()
                    .id(1L)
                    .employeeId(1L)
                    .employeeName("John Doe")
                    .mealId(1L)
                    .mealName("Chicken Biryani")
                    .orderDate(LocalDate.now().plusDays(1))
                    .quantity(2)
                    .totalPrice(new BigDecimal("25.00"))
                    .status(OrderStatus.CONFIRMED)
                    .build();

            when(orderService.updateOrderStatus(1L, OrderStatus.CONFIRMED)).thenReturn(response);

            // When & Then
            mockMvc.perform(patch("/api/v1/orders/1/status")
                            .with(csrf())
                            .param("status", "CONFIRMED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
        }
    }
}
