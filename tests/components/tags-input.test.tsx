import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { TagsInput } from "@/components/book/tags-input";

describe("TagsInput", () => {
  it("should render existing tags", () => {
    render(
      <TagsInput
        value={["fantasy", "sci-fi"]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("fantasy")).toBeInTheDocument();
    expect(screen.getByText("sci-fi")).toBeInTheDocument();
  });

  it("should add tag on Enter", () => {
    const onChange = vi.fn();
    render(<TagsInput value={[]} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "new-tag" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(["new-tag"]);
  });

  it("should add tag on comma", () => {
    const onChange = vi.fn();
    render(<TagsInput value={[]} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "comma-tag" } });
    fireEvent.keyDown(input, { key: "," });

    expect(onChange).toHaveBeenCalledWith(["comma-tag"]);
  });

  it("should remove tag on X click", () => {
    const onChange = vi.fn();
    render(
      <TagsInput value={["remove-me", "keep"]} onChange={onChange} />,
    );

    fireEvent.click(screen.getByLabelText("Remove remove-me"));

    expect(onChange).toHaveBeenCalledWith(["keep"]);
  });

  it("should remove last tag on backspace when input is empty", () => {
    const onChange = vi.fn();
    render(
      <TagsInput value={["first", "last"]} onChange={onChange} />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Backspace" });

    expect(onChange).toHaveBeenCalledWith(["first"]);
  });

  it("should not add duplicate tags", () => {
    const onChange = vi.fn();
    render(<TagsInput value={["existing"]} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "existing" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("should lowercase tags", () => {
    const onChange = vi.fn();
    render(<TagsInput value={[]} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "UPPERCASE" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(["uppercase"]);
  });

  it("should show placeholder when no tags", () => {
    render(
      <TagsInput
        value={[]}
        onChange={vi.fn()}
        placeholder="Add tags..."
      />,
    );

    expect(screen.getByPlaceholderText("Add tags...")).toBeInTheDocument();
  });
});
