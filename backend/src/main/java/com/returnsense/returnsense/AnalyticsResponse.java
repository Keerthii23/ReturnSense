package com.returnsense.returnsense;



public record AnalyticsResponse(
        long totalOrders,
        long returnedOrders,
        long notReturnedOrders,
        double returnRate,
        long categories
) {
}