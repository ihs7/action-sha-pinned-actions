/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: needs to mimic gha usage */
import { describe, expect, test } from "bun:test";
import { findNonSHAPinning, parseMultilineExcludePatterns } from "../src/main";

describe("findNonSHAPinning", () => {
	test("should identify actions not pinned to SHA", () => {
		const workflow = {
			jobs: {
				build: {
					steps: [
						{
							name: "Checkout code",
							uses: "actions/checkout@v4",
						},
						{
							name: "Setup Node",
							uses: "actions/setup-node@v3",
						},
					],
				},
			},
		};

		const violations = findNonSHAPinning(workflow, []);
		expect(violations).toHaveLength(2);
		expect(violations).toContain("actions/checkout@v4");
		expect(violations).toContain("actions/setup-node@v3");
	});

	test("should accept actions properly pinned to SHA", () => {
		const workflow = {
			jobs: {
				build: {
					steps: [
						{
							name: "Checkout code",
							uses: "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683",
						},
						{
							name: "Setup Node",
							uses: "actions/setup-node@8f152de45cc393bb48ce5d89d36b731f54556e65",
						},
					],
				},
			},
		};

		const violations = findNonSHAPinning(workflow, []);
		expect(violations).toHaveLength(0);
	});

	test("should ignore local actions", () => {
		const workflow = {
			jobs: {
				build: {
					steps: [
						{
							name: "Local Action",
							uses: "./",
						},
						{
							name: "Relative Path",
							uses: "../other-action",
						},
						{
							name: "Current Directory",
							uses: ".",
						},
					],
				},
			},
		};

		const violations = findNonSHAPinning(workflow, []);
		expect(violations).toHaveLength(0);
	});

	test("should handle nested structures", () => {
		const workflow = {
			jobs: {
				build: {
					strategy: {
						matrix: {
							node: [14, 16, 18],
						},
					},
					steps: [
						{
							name: "Checkout code",
							uses: "actions/checkout@v4",
						},
						{
							name: "Setup Node ${{ matrix.node }}",
							uses: "actions/setup-node@8f152de45cc393bb48ce5d89d36b731f54556e65",
							with: {
								"node-version": "${{ matrix.node }}",
							},
						},
					],
				},
				deploy: {
					steps: [
						{
							name: "Deploy",
							uses: "actions/deploy@main",
						},
					],
				},
			},
		};

		const violations = findNonSHAPinning(workflow, []);
		expect(violations).toHaveLength(2);
		expect(violations).toContain("actions/checkout@v4");
		expect(violations).toContain("actions/deploy@main");
	});

	test("should respect exclude patterns", () => {
		const workflow = {
			jobs: {
				build: {
					steps: [
						{
							name: "Checkout code",
							uses: "actions/checkout@v4",
						},
						{
							name: "Deploy",
							uses: "internal/deploy@v1",
						},
					],
				},
			},
		};

		const violations = findNonSHAPinning(workflow, ["internal/"]);
		expect(violations).toHaveLength(1);
		expect(violations).toContain("actions/checkout@v4");
	});

	test("should handle different SHA formats correctly", () => {
		const workflow = {
			jobs: {
				test: {
					steps: [
						// Valid SHA format
						{
							uses: "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683",
						},
						// Invalid SHA (too short)
						{
							uses: "actions/setup-node@8f152de",
						},
						// Invalid format (no @)
						{
							uses: "actions/setup-python-123456",
						},
						// Not a SHA
						{
							uses: "actions/setup-go@1.2.3",
						},
					],
				},
			},
		};

		const violations = findNonSHAPinning(workflow, []);
		expect(violations).toHaveLength(3);
		expect(violations).toContain("actions/setup-node@8f152de");
		expect(violations).toContain("actions/setup-python-123456");
		expect(violations).toContain("actions/setup-go@1.2.3");
	});

	test("should handle complex workflow with multiple jobs and arrays of steps", () => {
		const workflow = {
			jobs: {
				job1: {
					steps: [
						{
							uses: "actions/checkout@v4",
						},
					],
				},
				job2: {
					steps: [
						{
							uses: "actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683",
						},
					],
				},
				job3: {
					steps: [
						[
							{
								uses: "actions/setup-node@v3",
							},
						],
						{
							uses: "./local-action",
						},
					],
				},
			},
		};

		const violations = findNonSHAPinning(workflow, []);
		expect(violations).toHaveLength(2);
		expect(violations).toContain("actions/checkout@v4");
		expect(violations).toContain("actions/setup-node@v3");
	});
});

describe("parseMultilineExcludePatterns", () => {
	test("should parse multiline exclude patterns with comments", () => {
		const input = `
			azure/          # Exclude azure actions
			actions/checkout   # Exclude actions/checkout
			
			# This is a full line comment
			ihs7/    # ihs7 actions
		`;

		const patterns = parseMultilineExcludePatterns(input);
		expect(patterns).toHaveLength(3);
		expect(patterns).toContain("azure/");
		expect(patterns).toContain("actions/checkout");
		expect(patterns).toContain("ihs7/");
	});

	test("should handle empty and whitespace-only lines", () => {
		const input = `
			pattern1
			
			pattern2
			  
			pattern3
		`;

		const patterns = parseMultilineExcludePatterns(input);
		expect(patterns).toHaveLength(3);
		expect(patterns).toContain("pattern1");
		expect(patterns).toContain("pattern2");
		expect(patterns).toContain("pattern3");
	});

	test("should handle comments at the beginning of lines", () => {
		const input = `
			pattern1
			# This is ignored
			pattern2
		`;

		const patterns = parseMultilineExcludePatterns(input);
		expect(patterns).toHaveLength(2);
		expect(patterns).toContain("pattern1");
		expect(patterns).toContain("pattern2");
		expect(patterns).not.toContain("# This is ignored");
	});
});
