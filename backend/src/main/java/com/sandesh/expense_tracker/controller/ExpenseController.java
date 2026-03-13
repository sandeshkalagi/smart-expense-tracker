package com.sandesh.expense_tracker.controller;

import com.sandesh.expense_tracker.entity.Expense;
import com.sandesh.expense_tracker.service.ExpenseService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/expenses")
@CrossOrigin
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    // GET all expenses
    @GetMapping
    public List<Expense> getAllExpenses() {
        return expenseService.getAllExpenses();
    }

    // ADD expense
    @PostMapping
    public Expense addExpense(@RequestBody Expense expense) {
        return expenseService.saveExpense(expense);
    }

    // UPDATE expense
    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return expenseService.updateExpense(id, expense);
    }

    // DELETE expense
    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
    }

    // CATEGORY FILTER
    @GetMapping("/category/{category}")
    public List<Expense> getByCategory(@PathVariable String category) {
        return expenseService.getExpensesByCategory(category);
    }

    // SEARCH
    @GetMapping("/search")
    public List<Expense> searchExpenses(@RequestParam String keyword) {
        return expenseService.searchExpenses(keyword);
    }

    // DATE RANGE
    @GetMapping("/date-range")
    public List<Expense> getByDateRange(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end
    ) {
        return expenseService.getByDateRange(start, end);
    }

    // TOTAL
    @GetMapping("/total")
    public Double getTotalExpenses() {
        return expenseService.getTotalExpenses();
    }

    // CATEGORY SUMMARY
    @GetMapping("/category-summary")
    public List<Object[]> getCategorySummary() {
        return expenseService.getCategorySummary();
    }

}