package com.returnsense.returnsense;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final OrderReturnRepository repository;

    public AnalyticsService(OrderReturnRepository repository) {
        this.repository = repository;
    }

    public Map<String, Object> getAnalytics() {

        List<OrderReturn> orders = repository.findAll();

        long totalOrders = orders.size();

        long returnedOrders = orders.stream()
                .filter(order -> "returned".equalsIgnoreCase(
                        order.getReturnStatus()))
                .count();

        long notReturnedOrders = totalOrders - returnedOrders;

        double returnRate = totalOrders == 0
                ? 0.0
                : (returnedOrders * 100.0) / totalOrders;

        Map<String, Object> result = new HashMap<>();

        result.put("totalOrders", totalOrders);
        result.put("returnedOrders", returnedOrders);
        result.put("notReturnedOrders", notReturnedOrders);
        result.put("returnRate",
                Math.round(returnRate * 100.0) / 100.0);
        Map<String, Map<String, Object>> categoryAnalytics =
        orders.stream().collect(
                Collectors.groupingBy(
                        OrderReturn::getCategory,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                categoryOrders -> {
                                    long total = categoryOrders.size();

                                    long returned = categoryOrders.stream()
                                            .filter(order ->
                                                    "returned".equalsIgnoreCase(
                                                            order.getReturnStatus()))
                                            .count();

                                    double rate = total == 0
                                            ? 0.0
                                            : returned * 100.0 / total;

                                    Map<String, Object> stats =
                                            new HashMap<>();

                                    stats.put("totalOrders", total);
                                    stats.put("returnedOrders", returned);
                                    stats.put("returnRate",
                                            Math.round(rate * 100.0) / 100.0);

                                    return stats;
                                }
                        )
                )
        );

result.put("categoryAnalytics", categoryAnalytics);
        return result;
    }
}