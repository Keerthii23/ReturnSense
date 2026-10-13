package com.returnsense.returnsense;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import org.springframework.http.ResponseEntity;
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
    @PostMapping("/bulk")
public ResponseEntity<?> importOrders(
        @RequestBody List<OrderReturn> incomingOrders) {

    if (incomingOrders == null || incomingOrders.isEmpty()) {
        return ResponseEntity.badRequest()
                .body("The CSV contains no orders.");
    }

    Set<String> seenIds = new HashSet<>();
    List<OrderReturn> newOrders = new ArrayList<>();

    for (OrderReturn order : incomingOrders) {
        if (order.getOrderId() == null
                || order.getOrderId().isBlank()
                || order.getCategory() == null
                || order.getCategory().isBlank()
                || order.getReturnStatus() == null) {
            return ResponseEntity.badRequest()
                    .body("Order ID, category, and return status are required.");
        }

        String orderId = order.getOrderId().trim();
        String category = order.getCategory().trim();
        String status = order.getReturnStatus().trim()
                .toLowerCase();

        if (!status.equals("returned")
                && !status.equals("not_returned")) {
            return ResponseEntity.badRequest()
                    .body("Return status must be returned or not_returned.");
        }

        if (!seenIds.add(orderId)) {
            return ResponseEntity.badRequest()
                    .body("Duplicate order ID in the uploaded file: " + orderId);
        }

        if (!repository.existsByOrderId(orderId)) {
            OrderReturn newOrder = new OrderReturn();
            newOrder.setOrderId(orderId);
            newOrder.setCategory(category);
            newOrder.setReturnStatus(status);
            newOrders.add(newOrder);
        }
    }

    List<OrderReturn> savedOrders = repository.saveAll(newOrders);

    Map<String, Object> result = new HashMap<>();
    result.put("received", incomingOrders.size());
    result.put("saved", savedOrders.size());
    result.put("skippedExisting", incomingOrders.size() - savedOrders.size());
    result.put("message", "CSV import completed.");

    return ResponseEntity.status(HttpStatus.CREATED).body(result);
}
}
