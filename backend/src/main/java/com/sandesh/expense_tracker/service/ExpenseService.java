package com.sandesh.expense_tracker.service;

import com.sandesh.expense_tracker.entity.Expense;
import com.sandesh.expense_tracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense saveExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    public List<Expense> getExpensesByCategory(String category) {
        return expenseRepository.findByCategory(category);
    }

    public List<Expense> searchExpenses(String keyword) {
        return expenseRepository.searchExpenses(keyword);
    }

    public List<Expense> getByDateRange(LocalDate start, LocalDate end) {
        return expenseRepository.findByDateBetween(start, end);
    }

    public Double getTotalExpenses() {
        Double total = expenseRepository.getTotalExpenses();
        return total != null ? total : 0.0;
    }

    public List<Object[]> getCategorySummary() {
        return expenseRepository.getCategorySummary();
    }

    public Expense updateExpense(Long id, Expense details) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expense.setTitle(details.getTitle());
        expense.setAmount(details.getAmount());
        expense.setCategory(details.getCategory());
        expense.setDescription(details.getDescription());
        expense.setDate(details.getDate());

        return expenseRepository.save(expense);
    }
}