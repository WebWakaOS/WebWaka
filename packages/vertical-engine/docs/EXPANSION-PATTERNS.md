# Vertical Config Expansion Patterns

## Pillar 1 (Civic)
- Entity Type: organization
- Default Fields: displayName, description, address, contactPhone, contactEmail
- FSM States: seeded → claimed → active → suspended

## Pillar 2 (Commerce)  
- Entity Type: organization
- Default Fields: displayName, description, address, contactPhone, contactEmail, businessHours, paymentMethods
- FSM States: seeded → claimed → verified → active → suspended

## Pillar 3 (Operational)
- Entity Type: organization
- Default Fields: displayName, description, address, contactPhone, contactEmail, serviceArea
- FSM States: seeded → claimed → active

## High-Priority Verticals (32)

1. restaurant
2. supermarket
3. marketplace
4. beauty-salon
5. barber-shop
6. auto-mechanic
7. petrol-station
8. car-wash
9. laundry
10. tailor
11. mosque
12. ngo
13. youth-organization
14. womens-association
15. government-agency
16. dental-clinic
17. optician
18. vet-clinic
19. private-school
20. training-institute
21. logistics-delivery
22. cargo-truck
23. dispatch-rider
24. okada-keke
25. law-firm
26. accounting-firm
27. event-planner
28. photography-studio
29. farm
30. poultry-farm
31. fish-market
32. food-processing

## Expansion Process

1. Identify vertical pillar
2. Apply pillar-specific pattern
3. Customize fields based on vertical needs
4. Add sub-entities if applicable (inventory, bookings, etc.)
5. Run parity tests
6. Update maturity from 'stub' to 'expanded'

## Status

- Total verticals: 155
- Full configs: 5 (bakery, hotel, pharmacy, gym, church)
- To expand: 32 (high priority)
- Remaining stubs: ~118
