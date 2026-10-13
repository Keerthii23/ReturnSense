package com.returnsense.returnsense;



import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orders")
public class OrderReturnController {

    private final OrderReturnRepository repository;

    public OrderReturnController(OrderReturnRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<OrderReturn> getAllOrders() {
        return repository.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderReturn createOrder(@RequestBody OrderReturn order) {

        if (order.getOrderId() == null
                || order.getOrderId().isBlank()
                || order.getCategory() == null
                || order.getCategory().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order ID and category are required"
            );
        }

        String status = order.getReturnStatus();

        if (status == null
                || !(status.equalsIgnoreCase("returned")
                || status.equalsIgnoreCase("not_returned"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Return status must be returned or not_returned"
            );
        }

        order.setReturnStatus(status.toLowerCase());

        if (repository.existsByOrderId(order.getOrderId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This order ID already exists"
            );
        }

        return repository.save(order);
    }
}
