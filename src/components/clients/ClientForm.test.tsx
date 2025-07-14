// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import "@testing-library/jest-dom";
// import ClientForm from "./ClientForm";
// import * as clientActions from "@/app/clients/actions";
// // Mock the server actions
// jest.mock("@/app/clients/actions", () => ({
//   ...jest.requireActual("@/app/clients/actions"), // Import other actions
//   addClient: jest.fn(),
//   updateClient: jest.fn(),
// }));
// // Mock react-dom to provide useFormState and useFormStatus for the Jest/JSDOM environment.
// jest.mock("react-dom", () => ({
//   ...jest.requireActual("react-dom"),
//   useFormState: (action, initialState) => [initialState, action],
//   useFormStatus: () => ({ pending: false }),
// }));
// describe("ClientForm for Client Creation", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   it("should call the addClient action with correct FormData on submission", async () => {
//     const user = userEvent.setup();
//     const mockAddClient = clientActions.addClient as jest.Mock;
//     mockAddClient.mockResolvedValue({ success: true, errors: {} }); // Mock a successful response

//     render(<ClientForm initialData={null} action={mockAddClient} />);

//     // Find form fields and submit button
//     const nameInput = screen.getByLabelText("Name");
//     const emailInput = screen.getByLabelText("Email");
//     const phoneInput = screen.getByLabelText("Phone");
//     const statusSelect = screen.getByLabelText("Status");
//     const createButton = screen.getByRole("button", { name: "Create Client" });

//     // Simulate user filling in the form
//     await user.type(nameInput, "John Doe");
//     await user.type(emailInput, "john.doe@example.com");
//     await user.type(phoneInput, "555-1234");
//     await user.selectOptions(statusSelect, "active");

//     // Simulate form submission
//     await user.click(createButton);

//     // Wait for the action to be called
//     await waitFor(() => {
//       expect(mockAddClient).toHaveBeenCalledTimes(1);
//     });

//     // Get the FormData object from the mock call
//     const lastCall = mockAddClient.mock.lastCall;
//     expect(lastCall).toBeDefined();

//     // With our mocked useFormState, the action function is called directly with FormData as the first argument.
//     const formData = lastCall[0] as FormData;
//     expect(formData.get("name")).toBe("John Doe");
//     expect(formData.get("email")).toBe("john.doe@example.com");
//     expect(formData.get("phone")).toBe("555-1234");
//     expect(formData.get("status")).toBe("active");
//   });
// });
