package com.returnsense.returnsense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderReturnRepository
        extends JpaRepository<OrderReturn, Long> {

    boolean existsByOrderId(String orderId);

    long countByReturnStatusIgnoreCase(String returnStatus);
}